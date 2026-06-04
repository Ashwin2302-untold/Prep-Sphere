import type { DashboardData, ChapterStatus } from "@/hooks/useDashboardData";

export type SubjectKey = "physics" | "chemistry" | "mathematics" | "biology";

export interface ExamDef {
  title: string;
  targetDate: string;
  subjects: SubjectKey[];
}

export type ReviewPriority = "critical" | "high" | "medium";

export interface ReviewItem {
  subject: SubjectKey;
  chapterIndex: number;
  chapterName: string;
  reason: string;
  priority: ReviewPriority;
  estimatedMinutes: number;
  daysStuck?: number;
  nearestExamDays?: number;
  nearestExamTitle?: string;
}

const SUBJECT_EXAM_MAP: Record<SubjectKey, string[]> = {
  physics:     ["JEE Main 2027", "JEE Advanced 2027", "Boards 2027", "NEET 2027"],
  chemistry:   ["JEE Main 2027", "JEE Advanced 2027", "Boards 2027", "NEET 2027"],
  mathematics: ["JEE Main 2027", "JEE Advanced 2027", "Boards 2027"],
  biology:     ["NEET 2027"],
};

function daysBetween(dateStr: string, from: Date = new Date()) {
  return Math.floor((new Date(dateStr).getTime() - from.getTime()) / 86400000);
}

function daysStuck(ts: string, now: Date = new Date()) {
  return Math.floor((now.getTime() - new Date(ts).getTime()) / 86400000);
}

export function generateReviewSchedule(
  data: DashboardData,
  exams: ExamDef[],
  maxItems = 5,
  weakThresholdDays = 7
): ReviewItem[] {
  const now = new Date();
  const subjects: SubjectKey[] = ["physics", "chemistry", "mathematics", "biology"];

  // Pre-compute nearest exam per subject
  const nearestExam: Record<SubjectKey, { days: number; title: string } | null> = {
    physics: null, chemistry: null, mathematics: null, biology: null,
  };
  subjects.forEach(sub => {
    const relevant = exams
      .filter(e => SUBJECT_EXAM_MAP[sub].includes(e.title))
      .map(e => ({ days: daysBetween(e.targetDate, now), title: e.title }))
      .filter(e => e.days > 0)
      .sort((a, b) => a.days - b.days);
    nearestExam[sub] = relevant[0] ?? null;
  });

  const items: ReviewItem[] = [];
  const seen = new Set<string>();

  const add = (item: ReviewItem) => {
    const key = `${item.subject}_${item.chapterIndex}`;
    if (!seen.has(key)) {
      seen.add(key);
      items.push(item);
    }
  };

  // ── Priority 1: Weak (in_progress 7+ days, not snoozed) ────────────────────
  subjects.forEach(sub => {
    data[sub].chapters.forEach((ch, idx) => {
      if (ch.status !== "in_progress") return;
      const key = `${sub}_${idx}`;
      const ts = data.chapterTimestamps?.[key];
      if (!ts) return;
      const stuck = daysStuck(ts, now);
      if (stuck < weakThresholdDays) return;
      const snoozedUntil = data.snoozedChapters?.[key];
      if (snoozedUntil && new Date(snoozedUntil) > now) return;

      add({
        subject: sub,
        chapterIndex: idx,
        chapterName: ch.name,
        priority: "critical",
        estimatedMinutes: 45,
        daysStuck: stuck,
        reason: `Stuck for ${stuck} days — must revisit tonight`,
        nearestExamDays: nearestExam[sub]?.days,
        nearestExamTitle: nearestExam[sub]?.title,
      });
    });
  });

  // Sort critical by daysStuck desc
  items.sort((a, b) => (b.daysStuck ?? 0) - (a.daysStuck ?? 0));

  // ── Priority 2: In-progress (< 7 days) in high-relevance subjects ──────────
  const byNearestExam = [...subjects].sort((a, b) => {
    const da = nearestExam[a]?.days ?? Infinity;
    const db = nearestExam[b]?.days ?? Infinity;
    return da - db;
  });

  byNearestExam.forEach(sub => {
    if (items.length >= maxItems) return;
    data[sub].chapters.forEach((ch, idx) => {
      if (items.length >= maxItems) return;
      if (ch.status !== "in_progress") return;
      const key = `${sub}_${idx}`;
      const ts = data.chapterTimestamps?.[key];
      if (ts && daysStuck(ts, now) >= weakThresholdDays) return; // already captured
      const exam = nearestExam[sub];
      if (!exam) return;

      add({
        subject: sub,
        chapterIndex: idx,
        chapterName: ch.name,
        priority: "high",
        estimatedMinutes: 40,
        reason: `In progress — ${exam.title} in ${exam.days}d`,
        nearestExamDays: exam.days,
        nearestExamTitle: exam.title,
      });
    });
  });

  // ── Priority 3: Not-started chapters for near exams (< 180 days) ──────────
  byNearestExam.forEach(sub => {
    if (items.length >= maxItems) return;
    const exam = nearestExam[sub];
    if (!exam || exam.days > 180) return;

    data[sub].chapters.forEach((ch, idx) => {
      if (items.length >= maxItems) return;
      if (ch.status !== "not_started") return;

      add({
        subject: sub,
        chapterIndex: idx,
        chapterName: ch.name,
        priority: "medium",
        estimatedMinutes: 30,
        reason: `Not started — ${exam.title} in ${exam.days}d`,
        nearestExamDays: exam.days,
        nearestExamTitle: exam.title,
      });
    });
  });

  // ── Priority 4: Completed but not yet revised (near exam < 90 days) ────────
  byNearestExam.forEach(sub => {
    if (items.length >= maxItems) return;
    const exam = nearestExam[sub];
    if (!exam || exam.days > 90) return;

    data[sub].chapters.forEach((ch, idx) => {
      if (items.length >= maxItems) return;
      if (ch.status !== "completed") return;

      add({
        subject: sub,
        chapterIndex: idx,
        chapterName: ch.name,
        priority: "medium",
        estimatedMinutes: 20,
        reason: `Quick revision — ${exam.title} in ${exam.days}d`,
        nearestExamDays: exam.days,
        nearestExamTitle: exam.title,
      });
    });
  });

  return items.slice(0, maxItems);
}
