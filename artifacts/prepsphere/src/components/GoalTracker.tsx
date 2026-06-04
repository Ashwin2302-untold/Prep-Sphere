import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Plus, Check, Trash2, ChevronUp, ChevronDown, Minus } from "lucide-react";
import type { Goal } from "@/hooks/useDashboardData";

interface GoalTrackerProps {
  goals: Goal[];
  onAdd: (goal: Omit<Goal, "id" | "createdAt">) => void;
  onToggle: (id: string) => void;
  onUpdateProgress: (id: string, current: number) => void;
  onRemove: (id: string) => void;
}

const PRESET_TEMPLATES: Array<{
  label: string;
  icon: string;
  type: Goal["type"];
  defaultTarget: number;
  unit: string;
  placeholder: string;
}> = [
  { label: "Complete chapters", icon: "📖", type: "chapters", defaultTarget: 3, unit: "chapters", placeholder: "chapters this week" },
  { label: "Score on mock",     icon: "🎯", type: "score",    defaultTarget: 70, unit: "%",        placeholder: "% on next mock test" },
  { label: "Study hours/day",   icon: "⏱️", type: "hours",   defaultTarget: 6,  unit: "h/day",    placeholder: "hours per day" },
  { label: "Mock tests",        icon: "📝", type: "tests",   defaultTarget: 2,  unit: "tests",    placeholder: "mock tests this week" },
  { label: "Custom goal",       icon: "✨", type: "custom",  defaultTarget: 1,  unit: "",         placeholder: "Describe your goal..." },
];

function pct(current: number, target: number) {
  return Math.min(Math.round((current / target) * 100), 100);
}

function progressColor(p: number) {
  if (p >= 100) return "bg-emerald-400";
  if (p >= 60)  return "bg-blue-400";
  if (p >= 30)  return "bg-yellow-400";
  return "bg-red-400";
}

export default function GoalTracker({ goals, onAdd, onToggle, onUpdateProgress, onRemove }: GoalTrackerProps) {
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(0);
  const [targetVal, setTargetVal] = useState<string>("");
  const [customText, setCustomText] = useState("");
  const [deadline, setDeadline] = useState("");

  const template = PRESET_TEMPLATES[selected];
  const effectiveTarget = targetVal ? Number(targetVal) : template.defaultTarget;
  const effectiveText = template.type === "custom"
    ? customText
    : `${effectiveTarget} ${template.unit} — ${template.placeholder}`;

  const handleAdd = () => {
    if (template.type === "custom" && !customText.trim()) return;
    onAdd({
      text: effectiveText.trim(),
      type: template.type,
      target: template.type !== "custom" ? effectiveTarget : undefined,
      current: template.type !== "custom" ? 0 : undefined,
      unit: template.type !== "custom" ? template.unit : undefined,
      deadline: deadline || undefined,
      done: false,
    });
    setTargetVal("");
    setCustomText("");
    setDeadline("");
    setShowForm(false);
  };

  const active = goals.filter(g => !g.done);
  const done   = goals.filter(g => g.done);

  return (
    <div className="rounded-2xl card-glass p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-white subheading-shadow">Goals</h3>
          {active.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {active.length} active
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 text-sm hover:bg-cyan-500/30 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Goal
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-white/8 border border-white/15 space-y-3">
              {/* Template picker */}
              <div className="flex gap-1.5 flex-wrap">
                {PRESET_TEMPLATES.map((t, i) => (
                  <button
                    key={t.type + i}
                    onClick={() => setSelected(i)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-all ${
                      selected === i
                        ? "bg-cyan-500/25 text-cyan-200 border-cyan-500/40 font-semibold"
                        : "bg-white/8 text-white/60 border-white/15 hover:text-white/80"
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {template.type === "custom" ? (
                <input
                  type="text"
                  placeholder="e.g. Finish Organic Chemistry revision"
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/15 text-white text-sm rounded-lg focus:outline-none focus:border-cyan-400/60 placeholder:text-white/30"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60 flex-shrink-0">Target:</span>
                  <input
                    type="number"
                    placeholder={String(template.defaultTarget)}
                    value={targetVal}
                    onChange={e => setTargetVal(e.target.value)}
                    className="w-24 px-3 py-2 bg-white/10 border border-white/15 text-white text-sm rounded-lg focus:outline-none focus:border-cyan-400/60"
                  />
                  <span className="text-xs text-white/55">{template.unit}</span>
                  <span className="text-xs text-white/40 ml-1">{template.placeholder}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60 flex-shrink-0">Deadline:</span>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/15 text-white text-sm rounded-lg focus:outline-none focus:border-cyan-400/60"
                />
                <button
                  onClick={handleAdd}
                  disabled={template.type === "custom" && !customText.trim()}
                  className="px-4 py-2 rounded-lg bg-cyan-500/25 text-cyan-200 border border-cyan-500/35 text-sm font-semibold hover:bg-cyan-500/35 transition-colors disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {goals.length === 0 && (
        <p className="text-white/45 text-sm text-center py-6">
          No goals set yet — add one to track your targets 🎯
        </p>
      )}

      {/* Active goals */}
      <div className="space-y-2">
        <AnimatePresence>
          {active.map(goal => {
            const hasProgress = goal.target !== undefined && goal.current !== undefined;
            const p = hasProgress ? pct(goal.current!, goal.target!) : 0;
            const daysLeft = goal.deadline
              ? Math.max(0, Math.floor((new Date(goal.deadline).getTime() - Date.now()) / 86400000))
              : null;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl bg-white/8 border border-white/12 p-3 group"
              >
                <div className="flex items-start gap-2.5">
                  <button
                    onClick={() => onToggle(goal.id)}
                    className="mt-0.5 w-5 h-5 rounded-full border-2 border-white/30 flex items-center justify-center flex-shrink-0 hover:border-cyan-400/70 transition-colors group-hover:border-cyan-400/40"
                  >
                    {goal.done && <Check className="w-3 h-3 text-white" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white/90">{goal.text}</span>
                      {daysLeft !== null && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${
                          daysLeft <= 2 ? "bg-red-500/20 text-red-200 border-red-500/30"
                          : daysLeft <= 7 ? "bg-amber-500/20 text-amber-200 border-amber-500/30"
                          : "bg-white/8 text-white/50 border-white/15"
                        }`}>
                          {daysLeft === 0 ? "due today" : `${daysLeft}d left`}
                        </span>
                      )}
                    </div>

                    {hasProgress && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-white/55">{goal.current} / {goal.target} {goal.unit}</span>
                          <span className="text-[11px] font-semibold text-white/70">{p}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${p}%` }}
                            transition={{ duration: 0.5 }}
                            className={`h-full rounded-full ${progressColor(p)}`}
                          />
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <button
                            onClick={() => onUpdateProgress(goal.id, Math.max(0, (goal.current ?? 0) - 1))}
                            className="p-1 rounded-md bg-white/8 text-white/50 border border-white/12 hover:bg-white/15 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs text-white/60 px-1">{goal.current}</span>
                          <button
                            onClick={() => onUpdateProgress(goal.id, Math.min(goal.target!, (goal.current ?? 0) + 1))}
                            className="p-1 rounded-md bg-white/8 text-white/50 border border-white/12 hover:bg-white/15 transition-colors"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onRemove(goal.id)}
                    className="p-1.5 rounded-lg text-white/20 border border-transparent hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/25 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Completed goals (collapsed) */}
      {done.length > 0 && (
        <DoneGoals goals={done} onRemove={onRemove} />
      )}
    </div>
  );
}

function DoneGoals({ goals, onRemove }: { goals: Goal[]; onRemove: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors"
      >
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {goals.length} completed goal{goals.length > 1 ? "s" : ""}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-2 space-y-1.5"
          >
            {goals.map(g => (
              <div key={g.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/8 group opacity-60">
                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-xs text-white/60 line-through flex-1">{g.text}</span>
                <button onClick={() => onRemove(g.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-white/30 hover:text-red-400 transition-all">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
