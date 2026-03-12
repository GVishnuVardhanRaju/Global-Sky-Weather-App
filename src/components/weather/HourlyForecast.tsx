import type { HourlyData } from "@/lib/weatherApi";
import WeatherIcon from "./WeatherIcon";
import { motion } from "framer-motion";
import { useRef } from "react";

interface Props {
  hours: HourlyData[];
}

export default function HourlyForecast({ hours }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card rounded-3xl p-5"
    >
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Hourly Forecast
      </h3>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
        {hours.slice(0, 14).map((h, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.03 }}
            className="flex flex-col items-center gap-2 min-w-[52px]"
          >
            <span className="text-[11px] text-muted-foreground font-medium">{i === 0 ? "Now" : h.time}</span>
            <WeatherIcon icon={h.icon} size={22} animated={false} className="text-foreground/70" />
            <span className="text-sm font-semibold">{h.temp}°</span>
            {h.precipProb > 0 && (
              <span className="text-[10px] text-primary font-medium">{h.precipProb}%</span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
