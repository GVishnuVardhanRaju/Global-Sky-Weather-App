import type { DailyData } from "@/lib/weatherApi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, ComposedChart } from "recharts";
import { motion } from "framer-motion";

interface Props {
  days: DailyData[];
}

export default function HumidityWindChart({ days }: Props) {
  const chartData = days.map((d) => ({
    day: d.day,
    precipitation: d.precipitation,
    wind: d.windSpeed,
    rainChance: d.precipProb,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card rounded-3xl p-5"
    >
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Wind & Precipitation
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis yAxisId="right" orientation="right" hide />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: 12,
                boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
              }}
            />
            <Bar yAxisId="left" dataKey="precipitation" name="Rain (mm)" fill="hsl(215, 90%, 55%)" radius={[4, 4, 0, 0]} opacity={0.6} />
            <Bar yAxisId="left" dataKey="wind" name="Wind (km/h)" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} opacity={0.6} />
            <Line yAxisId="right" type="monotone" dataKey="rainChance" name="Rain %" stroke="hsl(200, 80%, 55%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(200, 80%, 55%)" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
