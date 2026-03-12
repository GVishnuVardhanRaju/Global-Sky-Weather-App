import type { DailyData } from "@/lib/weatherApi";
import WeatherIcon from "./WeatherIcon";
import { motion } from "framer-motion";

interface Props {
  days: DailyData[];
}

export default function WeeklyForecast({ days }: Props) {
  const maxTemp = Math.max(...days.map((d) => d.high));
  const minTemp = Math.min(...days.map((d) => d.low));
  const range = maxTemp - minTemp || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card rounded-3xl p-5"
    >
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        7-Day Forecast
      </h3>
      <div className="space-y-2.5">
        {days.map((d, i) => {
          const lowPct = ((d.low - minTemp) / range) * 100;
          const highPct = ((d.high - minTemp) / range) * 100;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.04 }}
              className="grid grid-cols-[48px_28px_1fr_52px] items-center gap-2"
            >
              <span className="text-sm font-medium">{d.day}</span>
              <WeatherIcon icon={d.icon} size={18} animated={false} className="text-foreground/70" />
              <div className="relative h-1.5 rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${highPct - lowPct}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.05 }}
                  className="absolute h-full rounded-full"
                  style={{
                    left: `${lowPct}%`,
                    background: `linear-gradient(90deg, hsl(var(--temp-low)), hsl(var(--temp-high)))`,
                  }}
                />
              </div>
              <div className="flex gap-1 text-xs justify-end">
                <span className="text-muted-foreground">{d.low}°</span>
                <span className="font-semibold">{d.high}°</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
