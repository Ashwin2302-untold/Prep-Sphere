import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trophy } from "lucide-react";
import { MockTest } from "@/hooks/useDashboardData";

interface MockTestTrackerProps {
  tests: MockTest[];
  onAdd: (test: Omit<MockTest, "id">) => void;
}

export default function MockTestTracker({ tests, onAdd }: MockTestTrackerProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ exam: "JEE Main", score: "", total: "360", date: new Date().toISOString().split("T")[0] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.score) return;
    onAdd({ exam: form.exam, score: Number(form.score), total: Number(form.total), date: form.date });
    setForm({ exam: "JEE Main", score: "", total: "360", date: new Date().toISOString().split("T")[0] });
    setShowForm(false);
  };

  const recent = [...tests].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  return (
    <div className="rounded-2xl card-glass p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h3 className="font-bold text-white subheading-shadow">Mock Test Scores</h3>
        </div>
        <button
          data-testid="button-add-mock-test"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-500/25 text-purple-200 border border-purple-500/35 text-sm hover:bg-purple-500/35 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Score
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleSubmit}
          className="mb-4 p-4 rounded-xl bg-white/8 border border-white/15 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/65 mb-1 block font-medium">Exam</label>
              <select
                data-testid="select-mock-exam"
                value={form.exam}
                onChange={e => setForm({ ...form, exam: e.target.value })}
                className="w-full bg-white/10 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400/60"
              >
                {["JEE Main", "JEE Advanced", "NEET", "Chapter Test"].map(e => (
                  <option key={e} value={e} className="bg-slate-900">{e}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/65 mb-1 block font-medium">Date</label>
              <input
                data-testid="input-mock-date"
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full bg-white/10 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400/60"
              />
            </div>
            <div>
              <label className="text-xs text-white/65 mb-1 block font-medium">Score</label>
              <input
                data-testid="input-mock-score"
                type="number"
                placeholder="e.g. 240"
                value={form.score}
                onChange={e => setForm({ ...form, score: e.target.value })}
                className="w-full bg-white/10 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400/60"
              />
            </div>
            <div>
              <label className="text-xs text-white/65 mb-1 block font-medium">Total Marks</label>
              <input
                data-testid="input-mock-total"
                type="number"
                placeholder="e.g. 360"
                value={form.total}
                onChange={e => setForm({ ...form, total: e.target.value })}
                className="w-full bg-white/10 border border-white/15 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400/60"
              />
            </div>
          </div>
          <button
            data-testid="button-submit-mock"
            type="submit"
            className="w-full py-2 rounded-lg bg-purple-500/30 text-purple-100 border border-purple-500/45 hover:bg-purple-500/40 transition-colors text-sm font-semibold"
          >
            Save Score
          </button>
        </motion.form>
      )}

      {recent.length === 0 ? (
        <p className="text-white/45 text-sm text-center py-6">No mock tests logged yet</p>
      ) : (
        <div className="space-y-2">
          {recent.map((t) => {
            const pct = Math.round((t.score / t.total) * 100);
            const color = pct >= 75 ? "text-emerald-300" : pct >= 50 ? "text-yellow-300" : "text-red-300";
            return (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-white/8 border border-white/10">
                <div>
                  <div className="text-sm font-semibold text-white/95">{t.exam}</div>
                  <div className="text-xs text-white/55">{new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold font-mono ${color}`}>{t.score}<span className="text-white/40 text-sm">/{t.total}</span></div>
                  <div className={`text-xs font-semibold ${color}`}>{pct}%</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
