import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Settings, X, Zap, Coffee, Moon, CheckCircle2 } from "lucide-react";

interface PomodoroTimerProps {
  onSessionComplete: (hours: number) => void;
}

type Mode = "work" | "short" | "long";

const MODE_CONFIG: Record<Mode, { label: string; color: string; ring: string; bg: string; icon: React.ReactNode; accent: string }> = {
  work:  { label: "DEEP FOCUS",   color: "text-violet-300",  ring: "#7c3aed", bg: "bg-violet-500/12", icon: <Zap className="w-4 h-4" />,    accent: "border-violet-500/35" },
  short: { label: "SHORT BREAK",  color: "text-cyan-300",    ring: "#0891b2", bg: "bg-cyan-500/12",   icon: <Coffee className="w-4 h-4" />, accent: "border-cyan-500/35" },
  long:  { label: "LONG BREAK",   color: "text-emerald-300", ring: "#059669", bg: "bg-emerald-500/12",icon: <Moon className="w-4 h-4" />,   accent: "border-emerald-500/35" },
};

const DEFAULT_SETTINGS = { work: 25, short: 5, long: 15 };
const SESSIONS_BEFORE_LONG = 4;
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function playBeep(freq = 660, duration = 0.4, type: OscillatorType = "sine") {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
    osc.onended = () => ctx.close();
  } catch { /* ignore audio errors */ }
}

function playSessionEnd() {
  setTimeout(() => playBeep(523, 0.15), 0);
  setTimeout(() => playBeep(659, 0.15), 160);
  setTimeout(() => playBeep(784, 0.35), 320);
}

function playBreakEnd() {
  setTimeout(() => playBeep(440, 0.2), 0);
  setTimeout(() => playBeep(523, 0.3), 220);
}

function fmt(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function PomodoroTimer({ onSessionComplete }: PomodoroTimerProps) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [draftSettings, setDraftSettings] = useState(DEFAULT_SETTINGS);

  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(settings.work * 60);
  const [totalSecs, setTotalSecs] = useState(settings.work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [todayFocusMinutes, setTodayFocusMinutes] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const advanceMode = useCallback((currentMode: Mode, currentSessions: number) => {
    if (currentMode === "work") {
      const newSessions = currentSessions + 1;
      setSessionsCompleted(newSessions);
      const focusMins = settings.work;
      const focusHours = Math.round((focusMins / 60) * 100) / 100;
      onSessionComplete(focusHours);
      setTodayFocusMinutes(prev => prev + focusMins);
      playSessionEnd();
      showToast(`🎯 Focus session done! +${focusMins}m logged to study hours`);
      if (newSessions % SESSIONS_BEFORE_LONG === 0) {
        setMode("long");
        setTimeLeft(settings.long * 60);
        setTotalSecs(settings.long * 60);
      } else {
        setMode("short");
        setTimeLeft(settings.short * 60);
        setTotalSecs(settings.short * 60);
      }
    } else {
      playBreakEnd();
      showToast("☕ Break over — ready for another focus session?");
      setMode("work");
      setTimeLeft(settings.work * 60);
      setTotalSecs(settings.work * 60);
    }
    setIsRunning(false);
  }, [settings, onSessionComplete, showToast]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          setMode(currentMode => {
            setSessionsCompleted(currentSessions => {
              advanceMode(currentMode, currentSessions);
              return currentSessions;
            });
            return currentMode;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, advanceMode]);

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(settings[mode] * 60);
    setTotalSecs(settings[mode] * 60);
  };

  const switchMode = (m: Mode) => {
    setIsRunning(false);
    setMode(m);
    setTimeLeft(settings[m] * 60);
    setTotalSecs(settings[m] * 60);
  };

  const applySettings = () => {
    const s = {
      work:  Math.max(1, Math.min(99, draftSettings.work)),
      short: Math.max(1, Math.min(30, draftSettings.short)),
      long:  Math.max(5, Math.min(60, draftSettings.long)),
    };
    setSettings(s);
    setTimeLeft(s[mode] * 60);
    setTotalSecs(s[mode] * 60);
    setIsRunning(false);
    setShowSettings(false);
  };

  const progress = totalSecs > 0 ? timeLeft / totalSecs : 1;
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const cfg = MODE_CONFIG[mode];

  const completedDots = Array.from({ length: SESSIONS_BEFORE_LONG }, (_, i) => i < (sessionsCompleted % SESSIONS_BEFORE_LONG || (sessionsCompleted > 0 && sessionsCompleted % SESSIONS_BEFORE_LONG === 0 ? SESSIONS_BEFORE_LONG : 0)));

  const todayH = Math.floor(todayFocusMinutes / 60);
  const todayM = todayFocusMinutes % 60;
  const todayLabel = todayH > 0 ? `${todayH}h ${todayM}m` : todayM > 0 ? `${todayM}m` : "—";

  return (
    <div className={`rounded-2xl card-glass overflow-hidden border ${cfg.accent}`}>
      {/* Mode tabs */}
      <div className="flex border-b border-white/10">
        {(["work", "short", "long"] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all ${
              mode === m
                ? `${MODE_CONFIG[m].color} ${MODE_CONFIG[m].bg} border-b-2 border-current`
                : "text-white/40 hover:text-white/65"
            }`}
          >
            {MODE_CONFIG[m].icon}
            <span className="hidden sm:inline">{MODE_CONFIG[m].label}</span>
            <span className="sm:hidden">{m === "work" ? "Focus" : m === "short" ? "Short" : "Long"}</span>
          </button>
        ))}
        <button
          onClick={() => { setShowSettings(v => !v); setDraftSettings(settings); }}
          className="px-3 py-2.5 text-white/30 hover:text-white/65 transition-colors border-l border-white/10"
          title="Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/10 bg-white/5"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white/70 uppercase tracking-widest">Timer Settings</span>
                <button onClick={() => setShowSettings(false)} className="text-white/30 hover:text-white/65">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {([
                  { key: "work" as const,  label: "Focus (min)" },
                  { key: "short" as const, label: "Short Break" },
                  { key: "long" as const,  label: "Long Break" },
                ] as const).map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-[10px] text-white/50 mb-1 block uppercase tracking-wide">{label}</label>
                    <input
                      type="number"
                      min={1}
                      max={key === "work" ? 99 : 60}
                      value={draftSettings[key]}
                      onChange={e => setDraftSettings(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                      className="w-full px-2 py-1.5 bg-white/10 border border-white/15 text-white text-sm rounded-lg focus:outline-none focus:border-violet-400/60 text-center font-mono"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={applySettings}
                className="w-full py-1.5 rounded-lg bg-violet-500/25 text-violet-200 border border-violet-500/35 text-xs font-semibold hover:bg-violet-500/35 transition-colors"
              >
                Apply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main timer area */}
      <div className="flex flex-col items-center py-7 px-4">
        {/* Circular ring */}
        <div className="relative mb-5">
          <svg width="140" height="140" className="-rotate-90">
            <circle
              cx="70" cy="70" r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="6"
            />
            <motion.circle
              cx="70" cy="70" r={RADIUS}
              fill="none"
              stroke={cfg.ring}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.5, ease: "linear" }}
              style={{ filter: `drop-shadow(0 0 8px ${cfg.ring}60)` }}
            />
          </svg>

          {/* Time display inside ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`text-4xl font-bold font-mono tabular-nums ${cfg.color}`}
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}
            >
              {fmt(timeLeft)}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${cfg.color} opacity-70`}>
              {cfg.label}
            </span>
          </div>
        </div>

        {/* Session dots */}
        <div className="flex items-center gap-2 mb-5">
          {completedDots.map((filled, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8 }}
              animate={{ scale: filled ? 1.1 : 1 }}
              className={`rounded-full transition-colors ${
                filled ? "w-3 h-3 bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.6)]" : "w-2.5 h-2.5 bg-white/15"
              }`}
            />
          ))}
          <span className="text-xs text-white/35 ml-1 font-mono">
            {sessionsCompleted} done
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={reset}
            className="p-2.5 rounded-xl bg-white/8 text-white/45 border border-white/12 hover:bg-white/15 hover:text-white/70 transition-all"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsRunning(v => !v)}
            className={`flex items-center gap-2 px-7 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-lg ${
              isRunning
                ? "bg-white/12 text-white/80 border border-white/20 hover:bg-white/18"
                : `${cfg.bg} ${cfg.color} border ${cfg.accent} hover:brightness-110`
            }`}
            style={isRunning ? {} : { boxShadow: `0 0 20px ${cfg.ring}30` }}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? "Pause" : "Start"}
          </motion.button>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/8 text-center min-w-[52px]" title="Today's focus time">
            <div className="text-xs font-bold text-white/75 font-mono leading-tight">{todayLabel}</div>
            <div className="text-[9px] text-white/35 uppercase tracking-wide mt-0.5">Today</div>
          </div>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              key="toast"
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/18 border border-emerald-500/30 text-emerald-200 text-xs font-medium"
            >
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer hint */}
      <div className="px-4 pb-3 text-center">
        <p className="text-[10px] text-white/30">
          Every completed focus session auto-logs to your study hours ✦
        </p>
      </div>
    </div>
  );
}
