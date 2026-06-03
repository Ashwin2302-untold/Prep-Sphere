import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
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
}

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

const defaultData: DashboardData = {
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
};

export function useDashboardData() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        setData({ ...defaultData, ...snap.data() as DashboardData });
      }
      setLoading(false);
    });
  }, [user]);

  const save = useCallback(async (updated: DashboardData) => {
    if (!user) return;
    setData(updated);
    await setDoc(doc(db, "users", user.uid), updated);
  }, [user]);

  const updateChapterStatus = useCallback(async (
    subject: keyof Pick<DashboardData, "physics" | "chemistry" | "mathematics" | "biology">,
    chapterIndex: number,
    status: ChapterStatus
  ) => {
    const updated = { ...data };
    updated[subject] = {
      ...updated[subject],
      chapters: updated[subject].chapters.map((ch, i) =>
        i === chapterIndex ? { ...ch, status } : ch
      ),
    };
    await save(updated);
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
    updateChapterStatus,
    addMockTest,
    logStudyHours,
    toggleMission,
    addMission,
    getStreak,
  };
}
