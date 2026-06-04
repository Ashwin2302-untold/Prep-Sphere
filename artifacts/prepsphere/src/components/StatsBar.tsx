import { useMemo } from "react";
import { motion } from "framer-motion";
import { BookCheck, NotebookPen, FlaskConical, Flame, TrendingUp, Target } from "lucide-react";
import type { DashboardData } from "@/hooks/useDashboardData";

interface StatsBarProps {
  data: DashboardData;
  streak: number;
}

interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  bg: string;
  border: string;
  bar?: number; // 0–100
  barColor?: string;
}

export default function StatsBar({ data, streak }: StatsBarProps) {
  const stats = useMemo((): StatItem[] => {
    const subjects = ["physics", "chemistry", "mathematics", "biology"] as const;

    // Chapters
    let totalChapters = 0;
    let doneChapters = 0;
    subjects.forEach(sub => {
      data[sub].chapters.forEach(ch => {
        totalChapters++;
        if (ch.status === "completed" || ch.status === "revised") doneChapters++;
      });
    });
    const completionPct = totalChapters > 0 ? Math.round((doneChapters / totalChapters) * 100) : 0;

    // Notes
    const notesCount = Object.keys(data.chapterNotes ?? {}).filter(k => data.chapterNotes[k]?.trim()).length;

    // Mock tests
    const tests = data.mockTests ?? [];
    const avgScore = tests.length > 0
      ? Math.round(tests.reduce((s, t) => s + (t.score / t.total) * 100, 0) / tests.length)
      : null;

    // Today's study hours
    const today = new Date().toISOString().split("T")[0];
    const todayHours = data.studyHours?.find(e => e.date === today)?.hours ?? 0;

    // In-progress chapters
    let inProgress = 0;
    subjects.forEach(sub => {
      data[sub].chapters.forEach(ch => {
        if (ch.status === "in_progress") inProgress++;
      });
    });

    return [
      {
        icon: <BookCheck className="w-4 h-4" />,
        label: "Chapters Done",
        value: `${doneChapters}/${totalChapters}`,
        sub: `${completionPct}% complete`,
        color: "text-emerald-300",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        bar: completionPct,
        barColor: "bg-emerald-400",
      },
      {
        icon: <TrendingUp className="w-4 h-4" />,
        label: "In Progress",
        value: inProgress,
        sub: inProgress === 0 ? "all clear!" : inProgress === 1 ? "chapter" : "chapters",
        color: "text-yellow-300",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        bar: totalChapters > 0 ? Math.round((inProgress / totalChapters) * 100) : 0,
        barColor: "bg-yellow-400",
      },
      {
        icon: <NotebookPen className="w-4 h-4" />,
        label: "Notes Saved",
        value: notesCount,
        sub: notesCount === 1 ? "chapter note" : "chapter notes",
        color: "text-violet-300",
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
      },
      {
        icon: <FlaskConical className="w-4 h-4" />,
        label: "Mock Avg",
        value: avgScore !== null ? `${avgScore}%` : "—",
        sub: tests.length > 0 ? `across ${tests.length} test${tests.length > 1 ? "s" : ""}` : "no tests yet",
        color: "text-blue-300",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        bar: avgScore ?? undefined,
        barColor: avgScore !== null
          ? avgScore >= 75 ? "bg-emerald-400"
          : avgScore >= 50 ? "bg-yellow-400"
          : "bg-red-400"
          : undefined,
      },
      {
        icon: <Flame className="w-4 h-4" />,
        label: "Study Streak",
        value: streak,
        sub: streak === 1 ? "day" : "days",
        color: "text-orange-300",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
      },
      {
        icon: <Target className="w-4 h-4" />,
        label: "Today",
        value: todayHours > 0 ? `${todayHours}h` : "—",
        sub: todayHours > 0 ? "studied today" : "log your hours",
        color: "text-pink-300",
        bg: "bg-pink-500/10",
        border: "border-pink-500/20",
        bar: Math.min(Math.round((todayHours / 10) * 100), 100),
        barColor: "bg-pink-400",
      },
    ];
  }, [data, streak]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`rounded-2xl border ${stat.bg} ${stat.border} backdrop-blur-sm p-4 flex flex-col gap-2`}
        >
          <div className={`flex items-center gap-1.5 ${stat.color}`}>
            {stat.icon}
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
              {stat.label}
            </span>
          </div>
          <div>
            <span className={`text-2xl font-bold ${stat.color} leading-none`}>{stat.value}</span>
            {stat.sub && (
              <p className="text-[11px] text-white/35 mt-0.5">{stat.sub}</p>
            )}
          </div>
          {stat.bar !== undefined && stat.barColor && (
            <div className="h-1 bg-white/8 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stat.bar}%` }}
                transition={{ duration: 0.7, delay: i * 0.05 + 0.2 }}
                className={`h-full rounded-full ${stat.barColor}`}
              />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
