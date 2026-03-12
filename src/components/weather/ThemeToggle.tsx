import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  dark: boolean;
  onToggle: () => void;
}

export default function ThemeToggle({ dark, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className="glass-card relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-primary/10"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: dark ? 180 : 0 }}
        transition={{ duration: 0.4 }}
      >
        {dark ? <Moon size={18} className="text-foreground" /> : <Sun size={18} className="text-foreground" />}
      </motion.div>
    </button>
  );
}
