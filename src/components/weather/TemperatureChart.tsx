import type { HourlyData } from "@/lib/weatherApi";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

interface Props {
  hours: HourlyData[];
}

export default function TemperatureChart({ hours }: Props) {
  const chartData = hours.slice(0, 14).map((h, i) => ({
    time: i === 0 ? "Now" : h.time,
    temp: h.temp,
    rain: h.precipProb,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="glass-card rounded-3xl p-5"
    >
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Temperature & Rain
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
            <defs>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(215, 90%, 55%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(215, 90%, 55%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(200, 80%, 55%)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(200, 80%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="temp"
              tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }}
              axisLine={false}
              tickLine={false}
              domain={["dataMin - 2", "dataMax + 2"]}
              tickFormatter={(v) => `${v}°`}
            />
            <YAxis yAxisId="rain" orientation="right" hide domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: 12,
                boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
              }}
              formatter={(value: number, name: string) => [
                name === "temp" ? `${value}°` : `${value}%`,
                name === "temp" ? "Temperature" : "Rain"
              ]}
            />
            <Area
              yAxisId="rain"
              type="monotone"
              dataKey="rain"
              stroke="hsl(200, 80%, 55%)"
              strokeWidth={1.5}
              fill="url(#rainGrad)"
              dot={false}
              strokeDasharray="4 3"
            />
            <Area
              yAxisId="temp"
              type="monotone"
              dataKey="temp"
              stroke="hsl(215, 90%, 55%)"
              strokeWidth={2.5}
              fill="url(#tempGrad)"
              dot={false}
              activeDot={{ r: 5, fill: "hsl(215, 90%, 55%)", stroke: "hsl(var(--card))", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
