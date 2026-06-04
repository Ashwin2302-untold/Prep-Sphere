import { useState, useEffect, useCallback, useRef } from "react";
import { doc, getDoc, setDoc, enableNetwork, disableNetwork } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

export type ChapterStatus = "not_started" | "in_progress" | "completed" | "revised";

export interface Chapter {
  name: string;
  status: ChapterStatus;
}

export interface SubjectData {
  chapters: Chapter[];
}

export interface MockTest {
  id: string;
  date: string;
  exam: string;
  score: number;
  total: number;
}

export interface Goal {
  id: string;
  text: string;
  type: "custom" | "chapters" | "score" | "hours" | "tests";
  target?: number;
  current?: number;
  unit?: string;
  deadline?: string;
  done: boolean;
  createdAt: string;
}

export interface StudyHourEntry {
  date: string;
  hours: number;
}

export interface DashboardData {
  physics: SubjectData;
  chemistry: SubjectData;
  mathematics: SubjectData;
  biology: SubjectData;
  mockTests: MockTest[];
  studyHours: StudyHourEntry[];
  streakStartDate: string;
  lastStudyDate: string;
  todayMissions: { id: string; text: string; done: boolean }[];
  chapterTimestamps: Record<string, string>; // "subject_index" -> ISO date entered in_progress
  snoozedChapters: Record<string, string>;   // "subject_index" -> ISO date snoozed until
  reviewChecks: Record<string, string>;      // "subject_index" -> YYYY-MM-DD last checked off
  chapterNotes: Record<string, string>;      // "subject_index" -> note/formula text
  goals: Goal[];
}

export type FirestoreStatus = "connecting" | "ok" | "offline" | "not_found" | "error";

const defaultPhysicsChapters: Chapter[] = [
  "Units & Measurements", "Kinematics", "Laws of Motion", "Work, Energy & Power",
  "Rotational Motion", "Gravitation", "Properties of Matter", "Thermodynamics",
  "Oscillations", "Waves", "Electrostatics", "Current Electricity",
  "Magnetic Effects", "Electromagnetic Induction", "Optics", "Modern Physics",
].map(name => ({ name, status: "not_started" }));

const defaultChemistryChapters: Chapter[] = [
  "Basic Concepts", "Atomic Structure", "Chemical Bonding", "States of Matter",
  "Thermodynamics", "Equilibrium", "Redox Reactions", "Electrochemistry",
  "Chemical Kinetics", "Surface Chemistry", "p-Block Elements", "d & f Block",
  "Coordination Compounds", "Organic Chemistry Basics", "Hydrocarbons",
  "Alcohols & Ethers", "Aldehydes & Ketones", "Carboxylic Acids", "Biomolecules",
].map(name => ({ name, status: "not_started" }));

const defaultMathChapters: Chapter[] = [
  "Sets & Relations", "Complex Numbers", "Matrices & Determinants", "Permutations",
  "Binomial Theorem", "Sequences & Series", "Limits & Continuity", "Differentiation",
  "Applications of Derivatives", "Integration", "Differential Equations",
  "Coordinate Geometry", "3D Geometry", "Vector Algebra", "Probability",
  "Trigonometry", "Mathematical Reasoning",
].map(name => ({ name, status: "not_started" }));

const defaultBiologyChapters: Chapter[] = [
  "The Living World", "Biological Classification", "Plant Kingdom", "Animal Kingdom",
  "Cell: Structure & Function", "Cell Division", "Transport in Plants",
  "Mineral Nutrition", "Photosynthesis", "Respiration", "Plant Growth",
  "Digestion & Absorption", "Breathing & Exchange", "Body Fluids", "Excretion",
  "Neural Control", "Chemical Coordination", "Reproduction in Plants",
  "Human Reproduction", "Reproductive Health", "Genetics", "Molecular Basis",
  "Evolution", "Human Health", "Biotechnology", "Ecosystems", "Biodiversity",
].map(name => ({ name, status: "not_started" }));

const DEFAULT_DATA: DashboardData = {
  physics: { chapters: defaultPhysicsChapters },
  chemistry: { chapters: defaultChemistryChapters },
  mathematics: { chapters: defaultMathChapters },
  biology: { chapters: defaultBiologyChapters },
  mockTests: [],
  studyHours: [],
  streakStartDate: new Date().toISOString().split("T")[0],
  lastStudyDate: "",
  todayMissions: [
    { id: "1", text: "Solve 30 MCQs from Physics", done: false },
    { id: "2", text: "Revise 2 Chemistry chapters", done: false },
    { id: "3", text: "Complete 1 Mock Test section", done: false },
    { id: "4", text: "Review yesterday's mistakes", done: false },
  ],
  chapterTimestamps: {},
  snoozedChapters: {},
  reviewChecks: {},
  chapterNotes: {},
  goals: [],
};

function getLocalKey(uid: string) {
  return `prepsphere_data_${uid}`;
}

function loadLocal(uid: string): DashboardData {
  try {
    const raw = localStorage.getItem(getLocalKey(uid));
    if (raw) return { ...DEFAULT_DATA, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_DATA };
}

function saveLocal(uid: string, data: DashboardData) {
  try {
    localStorage.setItem(getLocalKey(uid), JSON.stringify(data));
  } catch {}
}

function isNotFoundError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("offline");
}

export function useDashboardData() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [firestoreStatus, setFirestoreStatus] = useState<FirestoreStatus>("connecting");
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firestoreAvailable = useRef(false);

  const loadFromFirestore = useCallback(async (uid: string) => {
    try {
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const remote = { ...DEFAULT_DATA, ...(snap.data() as DashboardData) };
        setData(remote);
        saveLocal(uid, remote);
      } else {
        // Document doesn't exist yet — create it from local data
        const local = loadLocal(uid);
        await setDoc(ref, local);
        setData(local);
      }

      firestoreAvailable.current = true;
      setFirestoreStatus("ok");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[PrepSphere] Firestore load error:", msg);

      if (msg.toLowerCase().includes("not found")) {
        setFirestoreStatus("not_found");
      } else if (msg.toLowerCase().includes("offline") || msg.toLowerCase().includes("unavailable")) {
        setFirestoreStatus("offline");
      } else {
        setFirestoreStatus("error");
      }

      // Fall back to localStorage — app still works
      const local = loadLocal(uid);
      setData(local);
      firestoreAvailable.current = false;

      // Retry after 8 seconds
      if (retryRef.current) clearTimeout(retryRef.current);
      retryRef.current = setTimeout(() => {
        if (uid) loadFromFirestore(uid);
      }, 8000);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    // Immediately load from localStorage so the UI shows instantly
    const local = loadLocal(user.uid);
    setData(local);

    // Then try Firestore in background
    loadFromFirestore(user.uid).finally(() => setLoading(false));

    return () => {
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [user, loadFromFirestore]);

  const save = useCallback(async (updated: DashboardData) => {
    if (!user) return;
    setData(updated);
    saveLocal(user.uid, updated);

    if (!firestoreAvailable.current) return;

    try {
      await setDoc(doc(db, "users", user.uid), updated);
    } catch (err) {
      console.error("[PrepSphere] Firestore save error:", err);
      if (isNotFoundError(err)) {
        setFirestoreStatus("offline");
        firestoreAvailable.current = false;
      }
    }
  }, [user]);

  const retryFirestore = useCallback(async () => {
    if (!user) return;
    setFirestoreStatus("connecting");
    try {
      await enableNetwork(db);
    } catch {}
    await loadFromFirestore(user.uid);
  }, [user, loadFromFirestore]);

  const updateChapterStatus = useCallback(async (
    subject: keyof Pick<DashboardData, "physics" | "chemistry" | "mathematics" | "biology">,
    chapterIndex: number,
    status: ChapterStatus
  ) => {
    const key = `${subject}_${chapterIndex}`;
    const now = new Date().toISOString();
    const timestamps = { ...(data.chapterTimestamps ?? {}) };
    const snoozed = { ...(data.snoozedChapters ?? {}) };

    if (status === "in_progress" && !timestamps[key]) {
      timestamps[key] = now;
    } else if (status !== "in_progress") {
      delete timestamps[key];
      delete snoozed[key];
    }

    const updated = {
      ...data,
      chapterTimestamps: timestamps,
      snoozedChapters: snoozed,
    };
    updated[subject] = {
      ...updated[subject],
      chapters: updated[subject].chapters.map((ch, i) =>
        i === chapterIndex ? { ...ch, status } : ch
      ),
    };
    await save(updated);
  }, [data, save]);

  const snoozeChapter = useCallback(async (
    subject: keyof Pick<DashboardData, "physics" | "chemistry" | "mathematics" | "biology">,
    chapterIndex: number,
    days = 7
  ) => {
    const key = `${subject}_${chapterIndex}`;
    const until = new Date();
    until.setDate(until.getDate() + days);
    const snoozed = { ...(data.snoozedChapters ?? {}), [key]: until.toISOString() };
    await save({ ...data, snoozedChapters: snoozed });
  }, [data, save]);

  const toggleReviewCheck = useCallback(async (
    subject: keyof Pick<DashboardData, "physics" | "chemistry" | "mathematics" | "biology">,
    chapterIndex: number
  ) => {
    const key = `${subject}_${chapterIndex}`;
    const today = new Date().toISOString().split("T")[0];
    const checks = { ...(data.reviewChecks ?? {}) };
    if (checks[key] === today) {
      delete checks[key];
    } else {
      checks[key] = today;
    }
    await save({ ...data, reviewChecks: checks });
  }, [data, save]);

  const addGoal = useCallback(async (goal: Omit<Goal, "id" | "createdAt">) => {
    const newGoal: Goal = { ...goal, id: Date.now().toString(), createdAt: new Date().toISOString() };
    await save({ ...data, goals: [...(data.goals ?? []), newGoal] });
  }, [data, save]);

  const toggleGoal = useCallback(async (id: string) => {
    await save({ ...data, goals: (data.goals ?? []).map(g => g.id === id ? { ...g, done: !g.done } : g) });
  }, [data, save]);

  const updateGoalProgress = useCallback(async (id: string, current: number) => {
    await save({ ...data, goals: (data.goals ?? []).map(g => g.id === id ? { ...g, current } : g) });
  }, [data, save]);

  const removeGoal = useCallback(async (id: string) => {
    await save({ ...data, goals: (data.goals ?? []).filter(g => g.id !== id) });
  }, [data, save]);

  const saveChapterNote = useCallback(async (
    subject: keyof Pick<DashboardData, "physics" | "chemistry" | "mathematics" | "biology">,
    chapterIndex: number,
    note: string
  ) => {
    const key = `${subject}_${chapterIndex}`;
    const notes = { ...(data.chapterNotes ?? {}) };
    if (note.trim().length === 0) {
      delete notes[key];
    } else {
      notes[key] = note;
    }
    await save({ ...data, chapterNotes: notes });
  }, [data, save]);

  const addMockTest = useCallback(async (test: Omit<MockTest, "id">) => {
    const updated = {
      ...data,
      mockTests: [...data.mockTests, { ...test, id: Date.now().toString() }],
    };
    await save(updated);
  }, [data, save]);

  const logStudyHours = useCallback(async (hours: number) => {
    const today = new Date().toISOString().split("T")[0];
    const existing = data.studyHours.find(e => e.date === today);
    const studyHours = existing
      ? data.studyHours.map(e => e.date === today ? { ...e, hours } : e)
      : [...data.studyHours, { date: today, hours }];

    const lastStudyDate = data.lastStudyDate;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let streakStartDate = data.streakStartDate;
    if (lastStudyDate !== today && lastStudyDate !== yesterdayStr) {
      streakStartDate = today;
    }

    await save({ ...data, studyHours, streakStartDate, lastStudyDate: today });
  }, [data, save]);

  const toggleMission = useCallback(async (id: string) => {
    const updated = {
      ...data,
      todayMissions: data.todayMissions.map(m =>
        m.id === id ? { ...m, done: !m.done } : m
      ),
    };
    await save(updated);
  }, [data, save]);

  const addMission = useCallback(async (text: string) => {
    const updated = {
      ...data,
      todayMissions: [
        ...data.todayMissions,
        { id: Date.now().toString(), text, done: false },
      ],
    };
    await save(updated);
  }, [data, save]);

  const getStreak = useCallback(() => {
    const start = new Date(data.streakStartDate);
    const today = new Date();
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [data.streakStartDate]);

  return {
    data,
    loading,
    firestoreStatus,
    retryFirestore,
    updateChapterStatus,
    snoozeChapter,
    toggleReviewCheck,
    saveChapterNote,
    addGoal,
    toggleGoal,
    updateGoalProgress,
    removeGoal,
    addMockTest,
    logStudyHours,
    toggleMission,
    addMission,
    getStreak,
  };
}
