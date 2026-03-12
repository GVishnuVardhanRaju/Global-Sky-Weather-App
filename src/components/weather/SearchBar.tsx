import { useState, useRef, useEffect, useCallback } from "react";
import { Search, MapPin, X, Loader2 } from "lucide-react";
import { searchLocations, type GeoLocation, POPULAR_LOCATIONS } from "@/lib/weatherApi";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onSelect: (location: GeoLocation) => void;
  onLocate: () => void;
  isLocating?: boolean;
}

export default function SearchBar({ onSelect, onLocate, isLocating }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setSearching(true);
    try {
      const locs = await searchLocations(q);
      setResults(locs);
      setOpen(locs.length > 0);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, doSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (loc: GeoLocation) => {
    setQuery("");
    setOpen(false);
    onSelect(loc);
  };

  const handleFocus = () => {
    if (query.length < 2 && results.length === 0) {
      // Show popular locations on focus
      setResults(POPULAR_LOCATIONS.slice(0, 6));
      setOpen(true);
    } else if (results.length > 0) {
      setOpen(true);
    }
  };

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <div className="glass-card flex items-center gap-2 rounded-2xl px-4 py-3">
        <Search size={18} className="text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any city, state, or country..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          onFocus={handleFocus}
        />
        {searching && <Loader2 size={16} className="animate-spin text-muted-foreground" />}
        {query && !searching && (
          <button onClick={() => { setQuery(""); setResults([]); setOpen(false); }} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        )}
        <button
          onClick={onLocate}
          disabled={isLocating}
          className="text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
          title="Use current location"
        >
          {isLocating ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full glass-card rounded-2xl overflow-hidden max-h-80 overflow-y-auto"
          >
            {query.length < 2 && (
              <div className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Popular Cities
              </div>
            )}
            {results.map((loc, i) => (
              <button
                key={`${loc.name}-${loc.latitude}-${i}`}
                onClick={() => handleSelect(loc)}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-primary/10 transition-colors"
              >
                <MapPin size={14} className="text-muted-foreground shrink-0" />
                <div className="text-left">
                  <span className="font-medium">{loc.name}</span>
                  <span className="text-muted-foreground">
                    {loc.admin1 ? `, ${loc.admin1}` : ""}, {loc.country}
                  </span>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
