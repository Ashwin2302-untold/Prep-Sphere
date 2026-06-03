import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Chapter, ChapterStatus } from "@/hooks/useDashboardData";

const STATUS_CONFIG: Record<ChapterStatus, { label: string; color: string; dot: string }> = {
  not_started: { label: "Not Started", color: "bg-white/10 text-white/40 border-white/10", dot: "bg-white/30" },
  in_progress: { label: "In Progress", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", dot: "bg-yellow-400" },
  completed: { label: "Completed", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", dot: "bg-emerald-400" },
  revised: { label: "Revised", color: "bg-purple-500/20 text-purple-300 border-purple-500/30", dot: "bg-purple-400" },
};

const STATUSES: ChapterStatus[] = ["not_started", "in_progress", "completed", "revised"];

interface SubjectTrackerProps {
  subject: string;
  icon: string;
  color: string;
  chapters: Chapter[];
  onStatusChange: (index: number, status: ChapterStatus) => void;
}

export default function SubjectTracker({ subject, icon, color, chapters, onStatusChange }: SubjectTrackerProps) {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState<ChapterStatus | "all">("all");

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = chapters.filter(c => c.status === s).length;
    return acc;
  }, {} as Record<ChapterStatus, number>);

  const progress = Math.round((counts.completed + counts.revised) / chapters.length * 100);
  const filtered = filter === "all" ? chapters : chapters.filter(c => c.status === filter);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
      <button
        data-testid={`subject-expand-${subject.toLowerCase()}`}
        className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 text-left">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white">{subject}</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/50">{counts.completed + counts.revised}/{chapters.length} done</span>
              {expanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
            </div>
          </div>
          <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${color}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <div className="mt-1.5 flex gap-3 text-xs text-white/40">
            <span className="text-yellow-400">{counts.in_progress} in progress</span>
            <span className="text-emerald-400">{counts.completed} done</span>
            <span className="text-purple-400">{counts.revised} revised</span>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="flex gap-2 mb-3 flex-wrap">
                {(["all", ...STATUSES] as const).map(s => (
                  <button
                    key={s}
                    data-testid={`filter-${subject.toLowerCase()}-${s}`}
                    onClick={() => setFilter(s)}
                    className={`px-3 py-1 rounded-full text-xs border transition-all ${
                      filter === s
                        ? "bg-white/20 text-white border-white/30"
                        : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"
                    }`}
                  >
                    {s === "all" ? "All" : STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>

              <div className="space-y-1 max-h-72 overflow-y-auto pr-1 custom-scroll">
                {filtered.map((chapter, idx) => {
                  const realIdx = chapters.indexOf(chapter);
                  return (
                    <div
                      key={realIdx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-white/8 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[chapter.status].dot}`} />
                        <span className="text-sm text-white/80">{chapter.name}</span>
                      </div>
                      <select
                        data-testid={`chapter-status-${realIdx}`}
                        value={chapter.status}
                        onChange={e => onStatusChange(realIdx, e.target.value as ChapterStatus)}
                        className="text-xs bg-white/10 border border-white/10 text-white rounded-lg px-2 py-1 cursor-pointer focus:outline-none focus:border-purple-400/50"
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s} className="bg-slate-900">{STATUS_CONFIG[s].label}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
