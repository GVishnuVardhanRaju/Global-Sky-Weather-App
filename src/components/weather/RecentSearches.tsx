import { Clock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  searches: string[];
  onSelect: (city: string) => void;
  onRemove: (city: string) => void;
}

export default function RecentSearches({ searches, onSelect, onRemove }: Props) {
  if (searches.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2 flex-wrap"
    >
      <Clock size={14} className="text-muted-foreground" />
      <AnimatePresence>
        {searches.map((s) => (
          <motion.button
            key={s}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => onSelect(s)}
            className="glass-card flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/10 transition-colors"
          >
            {s.split(",")[0]}
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onRemove(s); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={12} />
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
