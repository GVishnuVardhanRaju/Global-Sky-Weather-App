import type { AirQualityData } from "@/lib/weatherApi";
import { motion } from "framer-motion";
import { Wind } from "lucide-react";

interface Props {
  data: AirQualityData;
}

export default function AirQuality({ data }: Props) {
  const maxAqi = 300;
  const progress = Math.min(data.aqi / maxAqi, 1);

  const colorMap: Record<string, string> = {
    "aqi-good": "hsl(142, 70%, 45%)",
    "aqi-moderate": "hsl(45, 90%, 50%)",
    "aqi-unhealthy": "hsl(15, 85%, 55%)",
    "aqi-hazardous": "hsl(0, 75%, 50%)",
  };

  const barColor = colorMap[data.color] || colorMap["aqi-good"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="glass-card rounded-3xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Wind size={14} className="text-muted-foreground" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Air Quality
        </h3>
      </div>

      <div className="flex items-end gap-3 mb-3">
        <span className="text-4xl font-bold" style={{ color: barColor }}>
          {data.aqi}
        </span>
        <span className="text-sm font-medium mb-1" style={{ color: barColor }}>
          {data.level}
        </span>
      </div>

      {/* AQI Bar */}
      <div className="relative h-2 rounded-full overflow-hidden mb-4"
        style={{ background: "linear-gradient(90deg, hsl(142,70%,45%), hsl(45,90%,50%), hsl(15,85%,55%), hsl(0,75%,50%))" }}>
        <motion.div
          initial={{ left: 0 }}
          animate={{ left: `${progress * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-card"
          style={{ backgroundColor: barColor, boxShadow: `0 0 8px ${barColor}` }}
        />
      </div>

      {/* Pollutants */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-secondary/50 rounded-xl p-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">PM2.5</span>
          <p className="text-lg font-semibold mt-0.5">{data.pm25} <span className="text-xs text-muted-foreground">µg/m³</span></p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">PM10</span>
          <p className="text-lg font-semibold mt-0.5">{data.pm10} <span className="text-xs text-muted-foreground">µg/m³</span></p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{data.recommendation}</p>
    </motion.div>
  );
}
