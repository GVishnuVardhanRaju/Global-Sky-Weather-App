import { Cloud, CloudDrizzle, CloudLightning, CloudRain, CloudSnow, Sun, CloudSun, Moon, CloudFog, type LucideProps } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

interface Props {
  icon: string;
  size?: number;
  className?: string;
  animated?: boolean;
}

const iconMap: Record<string, React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>> = {
  sunny: Sun,
  "partly-cloudy": CloudSun,
  cloudy: Cloud,
  foggy: CloudFog,
  rainy: CloudRain,
  drizzle: CloudDrizzle,
  thunderstorm: CloudLightning,
  snow: CloudSnow,
  night: Moon,
};

export default function WeatherIcon({ icon, size = 48, className = "", animated = true }: Props) {
  const Icon = iconMap[icon] || Sun;

  if (animated) {
    return (
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className={className}
      >
        <Icon size={size} />
      </motion.div>
    );
  }

  return (
    <div className={className}>
      <Icon size={size} />
    </div>
  );
}
