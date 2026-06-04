import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock, CheckCircle2, Circle, Clock, Zap, TrendingUp, Star } from "lucide-react";
import { generateReviewSchedule, type ExamDef, type ReviewPriority, type SubjectKey } from "@/lib/reviewScheduler";
import type { DashboardData } from "@/hooks/useDashboardData";

const SUBJECT_META: Record<SubjectKey, { icon: string; accent: string; pill: string }> = {
  physics:     { icon: "⚛️", accent: "text-blue-300",    pill: "bg-blue-500/15 text-blue-300 border-blue-500/25" },
  chemistry:   { icon: "🧪", accent: "text-emerald-300", pill: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" },
  mathematics: { icon: "📐", accent: "text-yellow-300",  pill: "bg-yellow-500/15 text-yellow-300 border-yellow-500/25" },
  biology:     { icon: "🧬", accent: "text-pink-300",    pill: "bg-pink-500/15 text-pink-300 border-pink-500/25" },
};

const PRIORITY_CONFIG: Record<ReviewPriority, {
  icon: React.ReactNode;
  label: string;
  ring: string;
  glow: string;
  rowHover: string;
}> = {
  critical: {
    icon: <Zap className="w-3 h-3" />,
    label: "Critical",
    ring: "border-red-500/30",
    glow: "shadow-red-900/20",
    rowHover: "hover:bg-red-500/5",
  },
  high: {
    icon: <TrendingUp className="w-3 h-3" />,
    label: "High",
    ring: "border-amber-500/30",
    glow: "shadow-amber-900/20",
    rowHover: "hover:bg-amber-500/5",
  },
  medium: {
    icon: <Star className="w-3 h-3" />,
    label: "Medium",
    ring: "border-purple-500/30",
    glow: "shadow-purple-900/20",
    rowHover: "hover:bg-white/3",
  },
};

const PRIORITY_BADGE: Record<ReviewPriority, string> = {
  critical: "bg-red-500/15 text-red-300 border-red-500/25",
  high:     "bg-amber-500/15 text-amber-300 border-amber-500/25",
  medium:   "bg-purple-500/15 text-purple-300 border-purple-500/25",
};

interface ReviewSchedulePanelProps {
  data: DashboardData;
  exams: ExamDef[];
  onToggleCheck: (subject: SubjectKey, chapterIndex: number) => void;
}

export default function ReviewSchedulePanel({ data, exams, onToggleCheck }: ReviewSchedulePanelProps) {
  const today = new Date().toISOString().split("T")[0];

  const schedule = useMemo(
    () => generateReviewSchedule(data, exams),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.physics, data.chemistry, data.mathematics, data.biology,
     data.chapterTimestamps, data.snoozedChapters]
  );

  if (schedule.length === 0) return null;

  const totalMinutes = schedule.reduce((s, i) => s + i.estimatedMinutes, 0);
  const doneCount = schedule.filter(item => {
    const key = `${item.subject}_${item.chapterIndex}`;
    return data.reviewChecks?.[key] === today;
  }).length;

  const progressPct = schedule.length > 0 ? Math.round((doneCount / schedule.length) * 100) : 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <CalendarClock className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest">
            Today's Review Plan
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-white/30">
            <Clock className="w-3 h-3" />
            ~{totalMinutes} min
          </span>
          {doneCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
              {doneCount}/{schedule.length} done
            </span>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-violet-500/15 bg-violet-500/5 backdrop-blur-sm overflow-hidden">
        {/* Progress bar */}
        <div className="h-0.5 bg-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-violet-500 to-emerald-500"
          />
        </div>

        {/* Items */}
        <div className="divide-y divide-white/5">
          <AnimatePresence>
            {schedule.map((item, i) => {
              const key = `${item.subject}_${item.chapterIndex}`;
              const checked = data.reviewChecks?.[key] === today;
              const meta = SUBJECT_META[item.subject];
              const prio = PRIORITY_CONFIG[item.priority];

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-start gap-3 px-4 py-3.5 transition-colors ${prio.rowHover} ${checked ? "opacity-50" : ""}`}
                >
                  {/* Check button */}
                  <button
                    onClick={() => onToggleCheck(item.subject, item.chapterIndex)}
                    className="flex-shrink-0 mt-0.5"
                    title={checked ? "Mark undone" : "Mark done for today"}
                  >
                    {checked
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      : <Circle className="w-5 h-5 text-white/20 hover:text-white/40 transition-colors" />
                    }
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base leading-none">{meta.icon}</span>
                      <span className={`text-sm font-semibold leading-tight ${checked ? "line-through text-white/30" : "text-white/85"}`}>
                        {item.chapterName}
                      </span>
                      <span className={`flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0 ${PRIORITY_BADGE[item.priority]}`}>
                        {prio.icon}
                        {prio.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs ${meta.accent}`}>{item.subject.charAt(0).toUpperCase() + item.subject.slice(1)}</span>
                      <span className="text-white/20 text-xs">·</span>
                      <span className="text-xs text-white/35">{item.reason}</span>
                    </div>
                  </div>

                  {/* Time estimate */}
                  <div className="flex-shrink-0 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-white/20" />
                    <span className="text-xs text-white/30">{item.estimatedMinutes}m</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Footer: all-done celebration */}
        <AnimatePresence>
          {doneCount === schedule.length && schedule.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 py-3 bg-emerald-500/10 border-t border-emerald-500/20 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <p className="text-xs text-emerald-300 font-medium">
                All review sessions complete — great work, astronaut! 🚀
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
