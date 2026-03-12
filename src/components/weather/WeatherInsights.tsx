import { generateInsights } from "@/lib/weatherApi";
import type { WeatherData } from "@/lib/weatherApi";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

interface Props {
  data: WeatherData;
}

export default function WeatherInsights({ data }: Props) {
  const insights = generateInsights(data);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className="glass-card rounded-3xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={14} className="text-accent" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Weather Insights
        </h3>
      </div>

      <div className="space-y-2.5">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="flex items-start gap-3 rounded-xl p-3"
            style={{ background: `hsl(var(--insight-bg))` }}
          >
            <p className="text-sm leading-relaxed">{insight}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
