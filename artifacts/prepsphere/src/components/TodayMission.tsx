import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Plus, Check } from "lucide-react";

interface Mission {
  id: string;
  text: string;
  done: boolean;
}

interface TodayMissionProps {
  missions: Mission[];
  onToggle: (id: string) => void;
  onAdd: (text: string) => void;
}

export default function TodayMission({ missions, onToggle, onAdd }: TodayMissionProps) {
  const [newMission, setNewMission] = useState("");

  const handleAdd = () => {
    if (!newMission.trim()) return;
    onAdd(newMission.trim());
    setNewMission("");
  };

  const done = missions.filter(m => m.done).length;
  const pct = missions.length > 0 ? Math.round((done / missions.length) * 100) : 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-violet-400" />
          <h3 className="font-bold text-white">Today's Mission</h3>
        </div>
        <span className="text-sm text-white/50">{done}/{missions.length}</span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-white/40 mb-1">
          <span>Daily progress</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="space-y-2 mb-4 max-h-52 overflow-y-auto">
        <AnimatePresence>
          {missions.map(m => (
            <motion.button
              key={m.id}
              data-testid={`mission-toggle-${m.id}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={() => onToggle(m.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors text-left group"
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                m.done
                  ? "bg-violet-500 border-violet-500"
                  : "border-white/20 group-hover:border-violet-400/50"
              }`}>
                {m.done && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className={`text-sm transition-colors ${m.done ? "line-through text-white/30" : "text-white/80"}`}>
                {m.text}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex gap-2">
        <input
          data-testid="input-new-mission"
          type="text"
          placeholder="Add a mission..."
          value={newMission}
          onChange={e => setNewMission(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          className="flex-1 px-3 py-2 bg-white/10 border border-white/10 text-white text-sm rounded-lg focus:outline-none focus:border-violet-400/50 placeholder:text-white/20"
        />
        <button
          data-testid="button-add-mission"
          onClick={handleAdd}
          className="px-3 py-2 rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
