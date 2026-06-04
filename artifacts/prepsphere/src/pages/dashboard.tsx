import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { LogOut, User, Satellite, BarChart2, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import StarField from "@/components/StarField";
import CountdownCard from "@/components/CountdownCard";
import SubjectTracker from "@/components/SubjectTracker";
import MockTestTracker from "@/components/MockTestTracker";
import StudyHoursTracker from "@/components/StudyHoursTracker";
import TodayMission from "@/components/TodayMission";
import FirestoreStatusBanner from "@/components/FirestoreStatusBanner";
import WeakTopicsPanel from "@/components/WeakTopicsPanel";
import ReviewSchedulePanel from "@/components/ReviewSchedulePanel";
import StatsBar from "@/components/StatsBar";
import GoalTracker from "@/components/GoalTracker";
import PomodoroTimer from "@/components/PomodoroTimer";
import { generateReport } from "@/lib/reportGenerator";
import type { ExamDef } from "@/lib/reviewScheduler";

const EXAMS: Array<ExamDef & { color: string; icon: string }> = [
  {
    title: "JEE Main 2027",
    targetDate: "2027-01-20",
    subjects: ["physics", "chemistry", "mathematics"],
    color: "bg-gradient-to-br from-blue-600 to-cyan-600",
    icon: "⚡",
  },
  {
    title: "JEE Advanced 2027",
    targetDate: "2027-05-25",
    subjects: ["physics", "chemistry", "mathematics"],
    color: "bg-gradient-to-br from-purple-600 to-indigo-600",
    icon: "🚀",
  },
  {
    title: "NEET 2027",
    targetDate: "2027-05-02",
    subjects: ["physics", "chemistry", "biology"],
    color: "bg-gradient-to-br from-emerald-600 to-teal-600",
    icon: "🧬",
  },
  {
    title: "Boards 2027",
    targetDate: "2027-02-15",
    subjects: ["physics", "chemistry", "mathematics"],
    color: "bg-gradient-to-br from-orange-500 to-amber-600",
    icon: "📚",
  },
];

const SUBJECTS = [
  { key: "physics" as const, label: "Physics", icon: "⚛️", color: "bg-blue-400" },
  { key: "chemistry" as const, label: "Chemistry", icon: "🧪", color: "bg-emerald-400" },
  { key: "mathematics" as const, label: "Mathematics", icon: "📐", color: "bg-yellow-400" },
  { key: "biology" as const, label: "Biology", icon: "🧬", color: "bg-pink-400" },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const {
    data, loading, firestoreStatus, retryFirestore,
    updateChapterStatus, snoozeChapter, toggleReviewCheck, saveChapterNote,
    addGoal, toggleGoal, updateGoalProgress, removeGoal,
    addStudyHours, addMockTest, logStudyHours, toggleMission, addMission, getStreak,
  } = useDashboardData();

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050818] flex items-center justify-center">
        <StarField />
        <div className="relative z-10 text-center">
          <div className="w-10 h-10 border-2 border-purple-400/40 border-t-purple-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/65 text-sm">Loading your mission data...</p>
        </div>
      </div>
    );
  }

  const firstName = user?.displayName?.split(" ")[0] ?? "Astronaut";

  return (
    <div className="min-h-screen bg-[#050818] relative overflow-x-hidden">
      <StarField />

      {/* Reduced nebula — less visual noise behind text */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[300px] rounded-full bg-purple-800/6 blur-3xl" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-blue-800/6 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[300px] rounded-full bg-indigo-800/4 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-16">
        {/* Header */}
        <header className="flex items-center justify-between py-5 border-b border-white/10 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Satellite className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none subheading-shadow">PrepSphere</h1>
              <p className="text-white/55 text-xs">Mission 2027</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              data-testid="button-analytics"
              onClick={() => setLocation("/analytics")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/35 text-indigo-200 hover:bg-indigo-500/30 transition-all text-sm font-medium"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Analytics
            </button>
            <button
              data-testid="button-export"
              onClick={() => generateReport(data, EXAMS, user?.email ?? "Student")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/35 text-emerald-200 hover:bg-emerald-500/30 transition-all text-sm font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/15">
              <User className="w-3.5 h-3.5 text-white/55" />
              <span className="text-sm text-white/80 font-medium">{firstName}</span>
            </div>
            <button
              data-testid="button-logout"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/8 border border-white/15 text-white/60 hover:text-white/90 hover:bg-white/15 transition-all text-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </header>

        {/* Firestore status banner */}
        <FirestoreStatusBanner status={firestoreStatus} onRetry={retryFirestore} />

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-1 heading-glow">
            Good {getGreeting()},{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {firstName}
            </span>
          </h2>
          <p className="text-white/65 text-sm">Your mission control is active. Let's conquer today.</p>
        </motion.div>

        {/* Countdowns */}
        <section className="mb-8">
          <h3 className="text-xs font-bold text-white/55 uppercase tracking-widest mb-3">Exam Countdowns</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {EXAMS.map((exam, i) => (
              <motion.div
                key={exam.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <CountdownCard {...exam} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Quick Stats */}
        <StatsBar data={data} streak={getStreak()} />

        {/* Focus Timer + Today's Mission */}
        <section className="mb-8">
          <h3 className="text-xs font-bold text-white/55 uppercase tracking-widest mb-3">Focus Timer</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <PomodoroTimer onSessionComplete={addStudyHours} />
            <TodayMission
              missions={data.todayMissions}
              onToggle={toggleMission}
              onAdd={addMission}
            />
          </div>
        </section>

        {/* Study Hours + Mock Tests */}
        <section className="mb-8">
          <h3 className="text-xs font-bold text-white/55 uppercase tracking-widest mb-3">Daily Tracking</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <StudyHoursTracker
              studyHours={data.studyHours}
              streak={getStreak()}
              onLog={logStudyHours}
            />
            <MockTestTracker
              tests={data.mockTests}
              onAdd={addMockTest}
            />
          </div>
        </section>

        {/* Goals */}
        <section className="mb-8">
          <h3 className="text-xs font-bold text-white/55 uppercase tracking-widest mb-3">Goal Tracker</h3>
          <GoalTracker
            goals={data.goals ?? []}
            onAdd={addGoal}
            onToggle={toggleGoal}
            onUpdateProgress={updateGoalProgress}
            onRemove={removeGoal}
          />
        </section>

        {/* Review Schedule */}
        <ReviewSchedulePanel
          data={data}
          exams={EXAMS}
          onToggleCheck={toggleReviewCheck}
        />

        {/* Weak Topics */}
        <WeakTopicsPanel
          data={data}
          onMarkStatus={updateChapterStatus}
          onSnooze={snoozeChapter}
        />

        {/* Subject Trackers */}
        <section>
          <h3 className="text-xs font-bold text-white/55 uppercase tracking-widest mb-3">Subject Trackers</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {SUBJECTS.map((subj, i) => (
              <motion.div
                key={subj.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <SubjectTracker
                  subject={subj.label}
                  subjectKey={subj.key}
                  icon={subj.icon}
                  color={subj.color}
                  chapters={data[subj.key].chapters}
                  notes={data.chapterNotes ?? {}}
                  onStatusChange={(idx, status) => updateChapterStatus(subj.key, idx, status)}
                  onSaveNote={(idx, note) => saveChapterNote(subj.key, idx, note)}
                />
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
