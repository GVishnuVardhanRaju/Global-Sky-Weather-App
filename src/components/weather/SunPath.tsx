import { motion } from "framer-motion";

interface Props {
  sunrise: string;
  sunset: string;
  sunriseTimestamp: number;
  sunsetTimestamp: number;
}

export default function SunPath({ sunrise, sunset, sunriseTimestamp, sunsetTimestamp }: Props) {
  const now = Date.now();
  const dayLength = sunsetTimestamp - sunriseTimestamp;
  const elapsed = Math.max(0, Math.min(now - sunriseTimestamp, dayLength));
  const progress = dayLength > 0 ? elapsed / dayLength : 0;
  const isDay = now >= sunriseTimestamp && now <= sunsetTimestamp;

  // Day length in hours
  const dayHours = Math.floor(dayLength / 3600000);
  const dayMinutes = Math.floor((dayLength % 3600000) / 60000);

  // Remaining daylight
  const remaining = Math.max(0, sunsetTimestamp - now);
  const remHours = Math.floor(remaining / 3600000);
  const remMinutes = Math.floor((remaining % 3600000) / 60000);

  // Arc calculation
  const width = 280;
  const height = 100;
  const cx = width / 2;
  const r = 130;
  const startAngle = Math.PI;
  const endAngle = 0;

  const arcPath = `M ${cx - r} ${height} A ${r} ${r} 0 0 1 ${cx + r} ${height}`;

  // Sun position along arc
  const angle = startAngle - progress * (startAngle - endAngle);
  const sunX = cx + r * Math.cos(angle);
  const sunY = height - r * Math.sin(angle);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card rounded-3xl p-5"
    >
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Sunrise & Sunset
      </h3>

      <div className="flex justify-center">
        <svg viewBox={`0 0 ${width} ${height + 30}`} width="100%" className="max-w-[300px]">
          {/* Dashed arc background */}
          <path
            d={arcPath}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Progress arc */}
          {isDay && (
            <path
              d={arcPath}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="sun-path-arc"
              style={{
                strokeDasharray: Math.PI * r,
                strokeDashoffset: Math.PI * r * (1 - progress),
              }}
            />
          )}

          {/* Horizon line */}
          <line
            x1={cx - r - 10}
            y1={height}
            x2={cx + r + 10}
            y2={height}
            stroke="hsl(var(--border))"
            strokeWidth="1"
          />

          {/* Sun */}
          {isDay && (
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <circle cx={sunX} cy={sunY} r="14" fill="hsl(40, 95%, 55%)" opacity="0.2" />
              <circle cx={sunX} cy={sunY} r="8" fill="hsl(40, 95%, 55%)" />
              <circle cx={sunX} cy={sunY} r="5" fill="hsl(45, 100%, 65%)" />
            </motion.g>
          )}

          {/* Labels */}
          <text x={cx - r} y={height + 18} textAnchor="middle" className="fill-muted-foreground" fontSize="10" fontWeight="500">
            {sunrise}
          </text>
          <text x={cx + r} y={height + 18} textAnchor="middle" className="fill-muted-foreground" fontSize="10" fontWeight="500">
            {sunset}
          </text>
        </svg>
      </div>

      <div className="flex justify-between mt-2 text-xs">
        <div>
          <span className="text-muted-foreground">Day length: </span>
          <span className="font-medium">{dayHours}h {dayMinutes}m</span>
        </div>
        {isDay && remaining > 0 && (
          <div>
            <span className="text-muted-foreground">Daylight left: </span>
            <span className="font-medium">{remHours}h {remMinutes}m</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
