import type { WeatherData } from "@/lib/weatherApi";
import WeatherIcon from "./WeatherIcon";
import { motion } from "framer-motion";

interface Props {
  data: WeatherData;
}

const gradientMap: Record<string, string> = {
  sunny: "weather-gradient-sunny",
  "partly-cloudy": "weather-gradient",
  cloudy: "weather-gradient-cloudy",
  foggy: "weather-gradient-cloudy",
  rainy: "weather-gradient-rainy",
  drizzle: "weather-gradient-rainy",
  thunderstorm: "weather-gradient-thunderstorm",
  snow: "weather-gradient-snow",
  night: "weather-gradient-night",
};

export default function CurrentWeather({ data }: Props) {
  const gradient = gradientMap[data.icon] || "weather-gradient";
  const todayHigh = data.daily[0]?.high ?? data.temp + 3;
  const todayLow = data.daily[0]?.low ?? data.temp - 4;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`${gradient} relative overflow-hidden rounded-3xl p-8 md:p-10 text-primary-foreground`}
    >
      {/* Animated decorative elements */}
      <motion.div
        className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary-foreground/8 blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.12, 0.08] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary-foreground/5 blur-2xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-1/2 right-1/4 h-32 w-32 rounded-full bg-primary-foreground/5 blur-xl"
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="text-center md:text-left">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.8, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-medium tracking-wide uppercase"
          >
            {data.location}{data.admin1 ? `, ${data.admin1}` : ""}, {data.country}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-2 flex items-start gap-1"
          >
            <span className="text-8xl md:text-9xl font-extralight leading-none tracking-tighter">
              {data.temp}
            </span>
            <span className="text-3xl font-extralight mt-2">°</span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-lg font-medium"
          >
            {data.condition}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.5 }}
            className="text-sm mt-1"
          >
            Feels like {data.feelsLike}° · H:{todayHigh}° L:{todayLow}°
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <WeatherIcon
            icon={data.icon}
            size={110}
            className="text-primary-foreground/90 drop-shadow-2xl animate-glow"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
