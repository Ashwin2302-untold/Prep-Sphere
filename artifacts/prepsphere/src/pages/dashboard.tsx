import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { LogOut, User, Satellite } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import StarField from "@/components/StarField";
import CountdownCard from "@/components/CountdownCard";
import SubjectTracker from "@/components/SubjectTracker";
import MockTestTracker from "@/components/MockTestTracker";
import StudyHoursTracker from "@/components/StudyHoursTracker";
import TodayMission from "@/components/TodayMission";
import FirestoreStatusBanner from "@/components/FirestoreStatusBanner";

const EXAMS = [
  {
    title: "JEE Main 2027",
    targetDate: "2027-01-20",
    color: "bg-gradient-to-br from-blue-600 to-cyan-600",
    icon: "⚡",
  },
  {
    title: "JEE Advanced 2027",
    targetDate: "2027-05-25",
    color: "bg-gradient-to-br from-purple-600 to-indigo-600",
    icon: "🚀",
  },
  {
    title: "NEET 2027",
    targetDate: "2027-05-02",
    color: "bg-gradient-to-br from-emerald-600 to-teal-600",
    icon: "🧬",
  },
  {
    title: "Boards 2027",
    targetDate: "2027-02-15",
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
  const { data, loading, firestoreStatus, retryFirestore, updateChapterStatus, addMockTest, logStudyHours, toggleMission, addMission, getStreak } = useDashboardData();

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050818] flex items-center justify-center">
        <StarField />
        <div className="relative z-10 text-center">
          <div className="w-10 h-10 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40 text-sm">Loading your mission data...</p>
        </div>
      </div>
    );
  }

  const firstName = user?.displayName?.split(" ")[0] ?? "Astronaut";

  return (
    <div className="min-h-screen bg-[#050818] relative overflow-x-hidden">
      <StarField />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[300px] rounded-full bg-purple-800/10 blur-3xl" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-blue-800/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[300px] rounded-full bg-indigo-800/8 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-16">
        {/* Header */}
        <header className="flex items-center justify-between py-5 border-b border-white/5 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Satellite className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">PrepSphere</h1>
              <p className="text-white/30 text-xs">Mission 2027</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <User className="w-3.5 h-3.5 text-white/40" />
              <span className="text-sm text-white/60">{firstName}</span>
            </div>
            <button
              data-testid="button-logout"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/10 transition-all text-sm"
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
          <h2 className="text-3xl font-bold text-white mb-1">
            Good {getGreeting()},{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {firstName}
            </span>
          </h2>
          <p className="text-white/40 text-sm">Your mission control is active. Let's conquer today.</p>
        </motion.div>

        {/* Countdowns */}
        <section className="mb-8">
          <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">Exam Countdowns</h3>
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

        {/* Today's Mission + Study Hours + Mock Tests */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          <div className="lg:col-span-1">
            <TodayMission
              missions={data.todayMissions}
              onToggle={toggleMission}
              onAdd={addMission}
            />
          </div>
          <div className="lg:col-span-1">
            <StudyHoursTracker
              studyHours={data.studyHours}
              streak={getStreak()}
              onLog={logStudyHours}
            />
          </div>
          <div className="lg:col-span-1">
            <MockTestTracker
              tests={data.mockTests}
              onAdd={addMockTest}
            />
          </div>
        </div>

        {/* Subject Trackers */}
        <section>
          <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">Subject Trackers</h3>
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
                  icon={subj.icon}
                  color={subj.color}
                  chapters={data[subj.key].chapters}
                  onStatusChange={(idx, status) => updateChapterStatus(subj.key, idx, status)}
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
