import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CountdownCardProps {
  title: string;
  targetDate: string;
  color: string;
  icon: string;
}

export default function CountdownCard({ title, targetDate, color, icon }: CountdownCardProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl p-4 border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
    >
      <div className={`absolute inset-0 opacity-10 ${color}`} />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{icon}</span>
          <h3 className="text-sm font-semibold text-white/80">{title}</h3>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[
            { label: "Days", value: timeLeft.days },
            { label: "Hrs", value: timeLeft.hours },
            { label: "Min", value: timeLeft.minutes },
            { label: "Sec", value: timeLeft.seconds },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className={`text-2xl font-bold font-mono text-white tabular-nums`}>
                {String(value).padStart(2, "0")}
              </div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
