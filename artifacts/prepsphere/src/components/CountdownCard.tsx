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
      className="relative rounded-2xl overflow-hidden card-glass"
    >
      <div className={`absolute inset-0 opacity-[0.08] ${color}`} />
      <div className="relative z-10 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{icon}</span>
          <h3 className="text-sm font-bold text-white subheading-shadow">{title}</h3>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[
            { label: "Days", value: timeLeft.days },
            { label: "Hrs", value: timeLeft.hours },
            { label: "Min", value: timeLeft.minutes },
            { label: "Sec", value: timeLeft.seconds },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold font-mono text-white tabular-nums" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                {String(value).padStart(2, "0")}
              </div>
              <div className="text-[10px] text-white/55 uppercase tracking-wider mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
