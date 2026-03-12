import { getSevereAlerts } from "@/lib/weatherApi";
import type { WeatherData } from "@/lib/weatherApi";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

interface Props {
  data: WeatherData;
}

export default function WeatherAlerts({ data }: Props) {
  const alerts = getSevereAlerts(data);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const visibleAlerts = alerts.filter((_, i) => !dismissed.has(i));

  if (visibleAlerts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-2"
    >
      <AnimatePresence>
        {alerts.map((alert, i) => {
          if (dismissed.has(i)) return null;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 rounded-2xl p-4"
              style={{
                background: "hsl(var(--alert-bg))",
                border: "1px solid hsl(var(--alert-border))",
              }}
            >
              <AlertTriangle size={18} className="text-destructive shrink-0" />
              <p className="text-sm flex-1 font-medium">{alert}</p>
              <button
                onClick={() => setDismissed(prev => new Set(prev).add(i))}
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
