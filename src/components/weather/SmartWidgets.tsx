import type { WeatherData } from "@/lib/weatherApi";
import { getMoonPhase } from "@/lib/weatherApi";
import { motion } from "framer-motion";
import { Droplets, CloudRain, Sun, Moon, Eye, Thermometer } from "lucide-react";

interface Props {
  data: WeatherData;
}

export default function SmartWidgets({ data }: Props) {
  const moonPhase = getMoonPhase();

  const uvColor =
    data.uvIndex >= 8
      ? "hsl(var(--uv-extreme))"
      : data.uvIndex >= 5
      ? "hsl(var(--uv-high))"
      : data.uvIndex >= 3
      ? "hsl(var(--uv-moderate))"
      : "hsl(var(--uv-low))";

  const uvLabel =
    data.uvIndex >= 11
      ? "Extreme"
      : data.uvIndex >= 8
      ? "Very High"
      : data.uvIndex >= 6
      ? "High"
      : data.uvIndex >= 3
      ? "Moderate"
      : "Low";

  return (
    <div className="w-full overflow-x-auto scrollbar-hide py-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex gap-4 min-w-max sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 sm:min-w-0"
      >
        {/* UV Index */}
        <div className="glass-card-hover rounded-2xl p-4 flex flex-col gap-2 min-w-[180px]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sun size={16} />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
              UV Index
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold" style={{ color: uvColor }}>
              {data.uvIndex}
            </span>
            <span className="text-xs sm:text-sm font-medium" style={{ color: uvColor }}>
              {uvLabel}
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden mt-1"
            style={{
              background:
                "linear-gradient(90deg, hsl(142,70%,45%), hsl(45,90%,50%), hsl(25,95%,55%), hsl(0,75%,50%))",
            }}
          >
            <div
              className="h-full rounded-full bg-card/50"
              style={{ marginLeft: `${Math.min((data.uvIndex / 12) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Dew Point */}
        <div className="glass-card-hover rounded-2xl p-4 flex flex-col gap-2 min-w-[180px]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Thermometer size={16} />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
              Dew Point
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-bold">{data.dewPoint}°</span>
          <span className="text-xs sm:text-sm text-muted-foreground">
            {data.dewPoint > 20
              ? "Muggy & uncomfortable"
              : data.dewPoint > 15
              ? "Somewhat humid"
              : "Comfortable"}
          </span>
        </div>

        {/* Rain Chance */}
        <div className="glass-card-hover rounded-2xl p-4 flex flex-col gap-2 min-w-[180px]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CloudRain size={16} />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
              Rain Chance
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-primary">{data.precipProb}</span>
            <span className="text-lg sm:text-xl font-bold text-primary">%</span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.precipProb}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-primary"
            />
          </div>
        </div>

        {/* Moon Phase */}
        <div className="glass-card-hover rounded-2xl p-4 flex flex-col gap-2 min-w-[180px]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Moon size={16} />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
              Moon Phase
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">{moonPhase.emoji}</span>
            <div>
              <p className="text-sm sm:text-base font-semibold">{moonPhase.name}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {moonPhase.illumination}% illuminated
              </p>
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div className="glass-card-hover rounded-2xl p-4 flex flex-col gap-2 min-w-[180px]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Eye size={16} />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
              Visibility
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-bold">
            {data.visibility} <span className="text-lg sm:text-xl text-muted-foreground">km</span>
          </span>
          <span className="text-xs sm:text-sm text-muted-foreground">
            {data.visibility > 10
              ? "Excellent clarity"
              : data.visibility > 5
              ? "Good visibility"
              : "Limited visibility"}
          </span>
        </div>

        {/* Humidity */}
        <div className="glass-card-hover rounded-2xl p-4 flex flex-col gap-2 min-w-[180px]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Droplets size={16} />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
              Humidity
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold">{data.humidity}</span>
            <span className="text-lg sm:text-xl text-muted-foreground">%</span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.humidity}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-primary/60"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}