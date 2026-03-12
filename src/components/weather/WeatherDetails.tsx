import type { WeatherData } from "@/lib/weatherApi";
import { Wind, Gauge, Thermometer, type LucideProps } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

interface Props {
  data: WeatherData;
}

type LucideIcon = React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;

interface DetailItem {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
}

export default function WeatherDetails({ data }: Props) {
  const items: DetailItem[] = [
    { icon: Thermometer, label: "Feels Like", value: `${data.feelsLike}°`, sub: data.feelsLike < data.temp - 3 ? "Wind chill effect" : data.feelsLike > data.temp + 3 ? "Heat index elevated" : "Close to actual" },
    { icon: Wind, label: "Wind", value: `${data.windSpeed} km/h`, sub: `Direction: ${data.windDirection}` },
    { icon: Gauge, label: "Pressure", value: `${data.pressure} hPa`, sub: data.pressure > 1020 ? "High pressure" : data.pressure < 1005 ? "Low pressure" : "Normal" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="grid grid-cols-3 gap-3"
    >
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.05 }}
          className="glass-card-hover rounded-2xl p-4 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <item.icon size={14} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">{item.label}</span>
          </div>
          <span className="text-2xl font-bold">{item.value}</span>
          {item.sub && <span className="text-xs text-muted-foreground">{item.sub}</span>}
        </motion.div>
      ))}
    </motion.div>
  );
}
