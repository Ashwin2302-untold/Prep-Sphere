import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Flame, Target } from "lucide-react";
import { StudyHourEntry } from "@/hooks/useDashboardData";

interface StudyHoursTrackerProps {
  studyHours: StudyHourEntry[];
  streak: number;
  onLog: (hours: number) => void;
}

export default function StudyHoursTracker({ studyHours, streak, onLog }: StudyHoursTrackerProps) {
  const [inputHours, setInputHours] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const todayEntry = studyHours.find(e => e.date === today);
  const weekEntries = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const ds = d.toISOString().split("T")[0];
    return { date: ds, hours: studyHours.find(e => e.date === ds)?.hours ?? 0 };
  });
  const weekTotal = weekEntries.reduce((s, e) => s + e.hours, 0);
  const maxHours = Math.max(...weekEntries.map(e => e.hours), 1);

  const handleLog = () => {
    const h = parseFloat(inputHours);
    if (isNaN(h) || h < 0 || h > 24) return;
    onLog(h);
    setInputHours("");
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-blue-400" />
        <h3 className="font-bold text-white">Study Hours</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="text-2xl font-bold text-blue-300">{todayEntry?.hours ?? 0}h</div>
          <div className="text-xs text-white/40 mt-0.5">Today</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <div className="text-2xl font-bold text-purple-300">{weekTotal.toFixed(1)}h</div>
          <div className="text-xs text-white/40 mt-0.5">This Week</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <div className="flex items-center justify-center gap-1">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-2xl font-bold text-orange-300">{streak}</span>
          </div>
          <div className="text-xs text-white/40 mt-0.5">Day Streak</div>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex items-end gap-1 h-16">
          {weekEntries.map((e, i) => (
            <div key={e.date} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(e.hours / maxHours) * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={`w-full rounded-t-md min-h-[2px] ${e.date === today ? "bg-blue-400" : "bg-white/20"}`}
              />
              <span className="text-[9px] text-white/30">
                {new Date(e.date).toLocaleDateString("en", { weekday: "narrow" })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            data-testid="input-study-hours"
            type="number"
            step="0.5"
            min="0"
            max="24"
            placeholder="Hours studied today"
            value={inputHours}
            onChange={e => setInputHours(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/10 text-white text-sm rounded-lg focus:outline-none focus:border-blue-400/50 placeholder:text-white/20"
          />
        </div>
        <button
          data-testid="button-log-hours"
          onClick={handleLog}
          className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 text-sm hover:bg-blue-500/30 transition-colors font-medium"
        >
          Log
        </button>
      </div>
    </div>
  );
}
