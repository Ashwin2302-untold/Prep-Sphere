import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, BellOff, CheckCircle, RotateCcw, Flame } from "lucide-react";
import type { DashboardData, ChapterStatus } from "@/hooks/useDashboardData";

const SUBJECT_META: Record<string, { label: string; icon: string; color: string; accent: string }> = {
  physics:     { label: "Physics",     icon: "⚛️", color: "border-blue-500/35 bg-blue-500/10",    accent: "text-blue-200" },
  chemistry:   { label: "Chemistry",   icon: "🧪", color: "border-emerald-500/35 bg-emerald-500/10", accent: "text-emerald-200" },
  mathematics: { label: "Mathematics", icon: "📐", color: "border-yellow-500/35 bg-yellow-500/10",  accent: "text-yellow-200" },
  biology:     { label: "Biology",     icon: "🧬", color: "border-pink-500/35 bg-pink-500/10",    accent: "text-pink-200" },
};

type SubjectKey = "physics" | "chemistry" | "mathematics" | "biology";

interface WeakTopic {
  subject: SubjectKey;
  chapterIndex: number;
  chapterName: string;
  daysStuck: number;
  snoozedUntil: string | null;
}

interface WeakTopicsPanelProps {
  data: DashboardData;
  onMarkStatus: (subject: SubjectKey, idx: number, status: ChapterStatus) => void;
  onSnooze: (subject: SubjectKey, idx: number, days?: number) => void;
  thresholdDays?: number;
}

function daysBetween(a: string, b: Date = new Date()) {
  return Math.floor((b.getTime() - new Date(a).getTime()) / 86400000);
}

function urgencyConfig(days: number) {
  if (days >= 21) return { label: `${days}d stuck`, badge: "bg-red-500/25 text-red-200 border-red-500/35", bar: "bg-red-500", ring: "ring-red-500/20" };
  if (days >= 14) return { label: `${days}d stuck`, badge: "bg-orange-500/25 text-orange-200 border-orange-500/35", bar: "bg-orange-500", ring: "ring-orange-500/20" };
  return { label: `${days}d stuck`, badge: "bg-amber-500/25 text-amber-200 border-amber-500/35", bar: "bg-amber-500", ring: "ring-amber-500/20" };
}

export default function WeakTopicsPanel({ data, onMarkStatus, onSnooze, thresholdDays = 7 }: WeakTopicsPanelProps) {
  const now = new Date();

  const weakTopics = useMemo((): WeakTopic[] => {
    const subjects: SubjectKey[] = ["physics", "chemistry", "mathematics", "biology"];
    const results: WeakTopic[] = [];
    subjects.forEach(subject => {
      data[subject].chapters.forEach((ch, idx) => {
        if (ch.status !== "in_progress") return;
        const key = `${subject}_${idx}`;
        const ts = data.chapterTimestamps?.[key];
        if (!ts) return;
        const days = daysBetween(ts, now);
        if (days < thresholdDays) return;
        const snoozedUntil = data.snoozedChapters?.[key] ?? null;
        if (snoozedUntil && new Date(snoozedUntil) > now) return;
        results.push({ subject, chapterIndex: idx, chapterName: ch.name, daysStuck: days, snoozedUntil });
      });
    });
    return results.sort((a, b) => b.daysStuck - a.daysStuck);
  }, [data, thresholdDays]);

  if (weakTopics.length === 0) return null;

  const criticalCount = weakTopics.filter(t => t.daysStuck >= 14).length;

  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-red-500/20 border border-red-500/35 flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          </div>
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">Weak Topics</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-200 border border-red-500/30">
            {weakTopics.length} stuck
          </span>
          {criticalCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-200 border border-orange-500/30">
              <Flame className="w-3 h-3" />
              {criticalCount} critical
            </span>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-red-500/20 overflow-hidden" style={{ background: "rgba(0,0,0,0.45)" }}>
        <div className="p-4 border-b border-white/8">
          <p className="text-xs text-white/55 mb-3">
            These chapters have been <span className="text-amber-300 font-semibold">In Progress</span> for {thresholdDays}+ days. Act on them tonight.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {weakTopics.slice(0, 3).map((t) => {
              const meta = SUBJECT_META[t.subject];
              const urg = urgencyConfig(t.daysStuck);
              return (
                <div key={`${t.subject}_${t.chapterIndex}`} className={`rounded-xl border p-3 ring-1 ${meta.color} ${urg.ring}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base">{meta.icon}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${urg.badge}`}>{urg.label}</span>
                  </div>
                  <p className={`text-sm font-bold ${meta.accent} leading-tight`}>{t.chapterName}</p>
                  <p className="text-xs text-white/45 mt-0.5">{meta.label}</p>
                  <div className="mt-2 h-0.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((t.daysStuck / 30) * 100, 100)}%` }} transition={{ duration: 0.6 }} className={`h-full rounded-full ${urg.bar}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="divide-y divide-white/8">
          <AnimatePresence>
            {weakTopics.map((t, i) => {
              const meta = SUBJECT_META[t.subject];
              const urg = urgencyConfig(t.daysStuck);
              return (
                <motion.div
                  key={`${t.subject}_${t.chapterIndex}`}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <span className="text-lg flex-shrink-0">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white/90 truncate">{t.chapterName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0 ${urg.badge}`}>{urg.label}</span>
                    </div>
                    <span className={`text-xs font-medium ${meta.accent}`}>{meta.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => onMarkStatus(t.subject, t.chapterIndex, "completed")} title="Mark Completed"
                      className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onMarkStatus(t.subject, t.chapterIndex, "revised")} title="Mark Revised"
                      className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-colors">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onSnooze(t.subject, t.chapterIndex, 7)} title="Snooze 7 days"
                      className="p-1.5 rounded-lg bg-white/8 text-white/45 border border-white/15 hover:bg-white/15 transition-colors">
                      <BellOff className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}
