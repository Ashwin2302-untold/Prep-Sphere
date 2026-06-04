import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter, Cell,
  ReferenceLine,
} from "recharts";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Trophy, Target, Zap, BarChart2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import StarField from "@/components/StarField";
import FirestoreStatusBanner from "@/components/FirestoreStatusBanner";

const EXAM_COLORS: Record<string, string> = {
  "JEE Main": "#818cf8",
  "JEE Advanced": "#a78bfa",
  "NEET": "#34d399",
  "Chapter Test": "#fbbf24",
};

const EXAM_FILTERS = ["All", "JEE Main", "JEE Advanced", "NEET", "Chapter Test"];

function pct(score: number, total: number) {
  return Math.round((score / total) * 100);
}

function trendIcon(slope: number) {
  if (slope > 1) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
  if (slope < -1) return <TrendingDown className="w-4 h-4 text-red-400" />;
  return <Minus className="w-4 h-4 text-white/40" />;
}

function trendColor(slope: number) {
  if (slope > 1) return "text-emerald-400";
  if (slope < -1) return "text-red-400";
  return "text-white/50";
}

function linearSlope(pts: number[]) {
  if (pts.length < 2) return 0;
  const n = pts.length;
  const xs = pts.map((_, i) => i);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = pts.reduce((a, b) => a + b, 0) / n;
  const num = xs.reduce((s, x, i) => s + (x - xMean) * (pts[i] - yMean), 0);
  const den = xs.reduce((s, x) => s + (x - xMean) ** 2, 0);
  return den === 0 ? 0 : num / den;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 border border-white/10 rounded-xl p-3 shadow-xl text-sm">
      <p className="text-white/50 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-white/70">{p.name}:</span>
          <span className="text-white font-semibold">{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data, firestoreStatus, retryFirestore } = useDashboardData();
  const [examFilter, setExamFilter] = useState("All");

  const tests = data.mockTests;

  const filtered = useMemo(
    () => examFilter === "All" ? tests : tests.filter(t => t.exam === examFilter),
    [tests, examFilter]
  );

  // Score trend over time
  const trendData = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.map((t, i) => ({
      label: new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      index: i + 1,
      score: pct(t.score, t.total),
      exam: t.exam,
      raw: `${t.score}/${t.total}`,
    }));
  }, [filtered]);

  const trendSlope = useMemo(() => linearSlope(trendData.map(d => d.score)), [trendData]);

  // Per-exam averages
  const examAverages = useMemo(() => {
    const exams = ["JEE Main", "JEE Advanced", "NEET", "Chapter Test"];
    return exams.map(exam => {
      const exTests = tests.filter(t => t.exam === exam);
      const avg = exTests.length
        ? Math.round(exTests.reduce((s, t) => s + pct(t.score, t.total), 0) / exTests.length)
        : 0;
      return { exam: exam.replace("JEE ", "JEE\n"), fullName: exam, avg, count: exTests.length };
    }).filter(e => e.count > 0);
  }, [tests]);

  // Subject radar — completion + revised as readiness score
  const radarData = useMemo(() => {
    const subjects = [
      { key: "physics" as const, label: "Physics" },
      { key: "chemistry" as const, label: "Chemistry" },
      { key: "mathematics" as const, label: "Maths" },
      { key: "biology" as const, label: "Biology" },
    ];
    return subjects.map(s => {
      const chs = data[s.key].chapters;
      const total = chs.length;
      const completed = chs.filter(c => c.status === "completed").length;
      const revised = chs.filter(c => c.status === "revised").length;
      const inProgress = chs.filter(c => c.status === "in_progress").length;
      const readiness = Math.round(((completed * 1 + revised * 1.2 + inProgress * 0.4) / total) * 100);
      return { subject: s.label, readiness: Math.min(readiness, 100), completed, revised };
    });
  }, [data]);

  // Best / worst / avg
  const stats = useMemo(() => {
    if (!filtered.length) return null;
    const scores = filtered.map(t => pct(t.score, t.total));
    return {
      best: Math.max(...scores),
      worst: Math.min(...scores),
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      total: filtered.length,
      bestTest: filtered.find(t => pct(t.score, t.total) === Math.max(...scores)),
    };
  }, [filtered]);

  // Score distribution buckets
  const distribution = useMemo(() => {
    const buckets = [
      { range: "0–25%", min: 0, max: 25, count: 0, color: "#ef4444" },
      { range: "25–50%", min: 25, max: 50, count: 0, color: "#f97316" },
      { range: "50–75%", min: 50, max: 75, count: 0, color: "#eab308" },
      { range: "75–90%", min: 75, max: 90, count: 0, color: "#22c55e" },
      { range: "90–100%", min: 90, max: 101, count: 0, color: "#6366f1" },
    ];
    filtered.forEach(t => {
      const p = pct(t.score, t.total);
      const b = buckets.find(b => p >= b.min && p < b.max);
      if (b) b.count++;
    });
    return buckets;
  }, [filtered]);

  return (
    <div className="min-h-screen bg-[#050818] relative overflow-x-hidden">
      <StarField />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/3 w-[500px] h-[300px] rounded-full bg-indigo-800/6 blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] rounded-full bg-purple-800/6 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-16">
        {/* Header */}
        <header className="flex items-center justify-between py-5 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <button
              data-testid="button-back-dashboard"
              onClick={() => setLocation("/dashboard")}
              className="flex items-center gap-2 text-white/65 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
            <span className="text-white/35">/</span>
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <span className="text-white font-semibold">Performance Analytics</span>
            </div>
          </div>
        </header>

        <FirestoreStatusBanner status={firestoreStatus} onRetry={retryFirestore} />

        {tests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
              <BarChart2 className="w-7 h-7 text-indigo-400/60" />
            </div>
            <h3 className="text-white/85 font-semibold text-lg mb-2">No mock tests logged yet</h3>
            <p className="text-white/55 text-sm max-w-xs">
              Go to the dashboard and add mock test scores to see your performance analytics here.
            </p>
            <button
              data-testid="button-go-dashboard"
              onClick={() => setLocation("/dashboard")}
              className="mt-6 px-5 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-sm hover:bg-indigo-500/30 transition-colors"
            >
              Go add scores
            </button>
          </motion.div>
        ) : (
          <>
            {/* Exam filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {EXAM_FILTERS.map(f => (
                <button
                  key={f}
                  data-testid={`filter-exam-${f.toLowerCase().replace(" ", "-")}`}
                  onClick={() => setExamFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                    examFilter === f
                      ? "bg-indigo-500/30 text-indigo-100 border-indigo-500/50 font-semibold"
                      : "bg-white/8 text-white/60 border-white/15 hover:border-white/30 hover:text-white/80"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Stat cards */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
              >
                {[
                  {
                    label: "Best Score",
                    value: `${stats.best}%`,
                    sub: stats.bestTest ? `${stats.bestTest.exam}` : "",
                    icon: <Trophy className="w-4 h-4 text-yellow-400" />,
                    color: "border-yellow-500/25",
                    vcolor: "text-yellow-200",
                  },
                  {
                    label: "Average",
                    value: `${stats.avg}%`,
                    sub: `across ${stats.total} tests`,
                    icon: <Target className="w-4 h-4 text-blue-400" />,
                    color: "border-blue-500/25",
                    vcolor: "text-blue-200",
                  },
                  {
                    label: "Trend",
                    value: trendSlope > 1 ? "Improving" : trendSlope < -1 ? "Declining" : "Stable",
                    sub: `${trendSlope > 0 ? "+" : ""}${trendSlope.toFixed(1)}% / test`,
                    icon: trendIcon(trendSlope),
                    color: "border-white/15",
                    vcolor: trendColor(trendSlope),
                  },
                  {
                    label: "Lowest Score",
                    value: `${stats.worst}%`,
                    sub: "room to improve",
                    icon: <Zap className="w-4 h-4 text-orange-400" />,
                    color: "border-orange-500/25",
                    vcolor: "text-orange-200",
                  },
                ].map(card => (
                  <div key={card.label} className={`rounded-2xl border p-4 card-glass ${card.color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {card.icon}
                      <span className="text-xs text-white/60 font-medium uppercase tracking-wide">{card.label}</span>
                    </div>
                    <div className={`text-2xl font-bold ${card.vcolor}`} style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>{card.value}</div>
                    <div className="text-xs text-white/50 mt-1">{card.sub}</div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Score trend chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl card-glass p-5 mb-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white subheading-shadow">Score Trend</h3>
                  <p className="text-xs text-white/55 mt-0.5">Percentage score over time</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs">
                  {trendIcon(trendSlope)}
                  <span className={trendColor(trendSlope)}>
                    {trendSlope > 1 ? "Improving" : trendSlope < -1 ? "Declining" : "Stable"}
                  </span>
                </div>
              </div>

              {trendData.length < 2 ? (
                <p className="text-white/55 text-sm text-center py-8">Add at least 2 tests to see trend</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={v => `${v}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={50} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                    <ReferenceLine y={75} stroke="rgba(99,102,241,0.2)" strokeDasharray="4 4" />
                    <Line
                      type="monotone"
                      dataKey="score"
                      name="Score"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        const color = EXAM_COLORS[payload.exam] ?? "#6366f1";
                        return <circle key={`dot-${payload.index}`} cx={cx} cy={cy} r={4} fill={color} stroke="#050818" strokeWidth={2} />;
                      }}
                      activeDot={{ r: 6, fill: "#a5b4fc", stroke: "#050818", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              {/* Per-exam averages */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl card-glass p-5"
              >
                <h3 className="font-bold text-white subheading-shadow mb-1">Average by Exam</h3>
                <p className="text-xs text-white/55 mb-4">Mean score % per exam type</p>

                {examAverages.length === 0 ? (
                  <p className="text-white/55 text-sm text-center py-8">No data</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={examAverages} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis
                        dataKey="fullName"
                        tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={v => `${v}%`}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.04)" }}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload as { fullName: string; avg: number; count: number };
                          return (
                            <div className="bg-slate-900/95 border border-white/10 rounded-xl p-3 text-sm">
                              <p className="text-white font-medium">{d.fullName}</p>
                              <p className="text-white/50">Avg: <span className="text-white">{d.avg}%</span></p>
                              <p className="text-white/50">Tests: <span className="text-white">{d.count}</span></p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="avg" name="Average %" radius={[6, 6, 0, 0]}>
                        {examAverages.map((entry) => (
                          <Cell key={entry.fullName} fill={EXAM_COLORS[entry.fullName] ?? "#6366f1"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </motion.div>

              {/* Score distribution */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl card-glass p-5"
              >
                <h3 className="font-bold text-white subheading-shadow mb-1">Score Distribution</h3>
                <p className="text-xs text-white/55 mb-4">How many tests fall in each range</p>

                <div className="space-y-3">
                  {distribution.map(b => {
                    const max = Math.max(...distribution.map(d => d.count), 1);
                    const w = b.count > 0 ? Math.max((b.count / max) * 100, 8) : 0;
                    return (
                      <div key={b.range} className="flex items-center gap-3">
                        <span className="text-xs text-white/60 w-16 flex-shrink-0">{b.range}</span>
                        <div className="flex-1 h-6 bg-white/5 rounded-md overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${w}%` }}
                            transition={{ duration: 0.5, delay: 0.25 }}
                            className="h-full rounded-md flex items-center px-2"
                            style={{ backgroundColor: b.color + "40", borderRight: `2px solid ${b.color}` }}
                          />
                        </div>
                        <span className="text-sm font-mono font-semibold w-6 text-right" style={{ color: b.color }}>
                          {b.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Subject readiness radar */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl card-glass p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white subheading-shadow">Subject Readiness</h3>
                  <p className="text-xs text-white/55 mt-0.5">
                    Based on completed + revised chapters (revised counts 1.2×)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }}
                      tickFormatter={v => `${v}%`}
                    />
                    <Radar
                      name="Readiness"
                      dataKey="readiness"
                      stroke="#818cf8"
                      fill="#818cf8"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload as { subject: string; readiness: number; completed: number; revised: number };
                        return (
                          <div className="bg-slate-900/95 border border-white/10 rounded-xl p-3 text-sm">
                            <p className="text-white font-medium">{d.subject}</p>
                            <p className="text-white/50">Readiness: <span className="text-indigo-300 font-semibold">{d.readiness}%</span></p>
                            <p className="text-white/50">Completed: <span className="text-emerald-300">{d.completed}</span></p>
                            <p className="text-white/50">Revised: <span className="text-purple-300">{d.revised}</span></p>
                          </div>
                        );
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {radarData.map(s => (
                    <div key={s.subject}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/70 font-medium">{s.subject}</span>
                        <span className="text-indigo-300 font-semibold">{s.readiness}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${s.readiness}%` }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        />
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-white/50">
                        <span><span className="text-emerald-400">{s.completed}</span> completed</span>
                        <span><span className="text-purple-400">{s.revised}</span> revised</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
