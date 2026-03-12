import { useState, useEffect, useCallback } from "react";
import { fetchWeather, type WeatherData, type GeoLocation, POPULAR_LOCATIONS } from "@/lib/weatherApi";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Plus, ChevronRight, Loader2 } from "lucide-react";

interface Props {
  onSelect: (location: GeoLocation) => void;
  currentLocation?: string;
}

interface FavoriteCity {
  location: GeoLocation;
  weather?: WeatherData;
}

export default function FavoriteCities({ onSelect, currentLocation }: Props) {
  const [favorites, setFavorites] = useState<FavoriteCity[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("favorite-cities") || "[]");
      return saved.map((loc: GeoLocation) => ({ location: loc }));
    } catch { return []; }
  });
  const [showAdd, setShowAdd] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Fetch weather for all favorites
  const refreshFavorites = useCallback(async () => {
    if (favorites.length === 0) return;
    setLoadingWeather(true);
    try {
      const updated = await Promise.all(
        favorites.map(async (fav) => {
          try {
            const weather = await fetchWeather(fav.location);
            return { ...fav, weather };
          } catch {
            return fav;
          }
        })
      );
      setFavorites(updated);
    } finally {
      setLoadingWeather(false);
    }
  }, [favorites.length]);

  useEffect(() => {
    if (favorites.length > 0 && !favorites[0].weather) {
      refreshFavorites();
    }
  }, []);

  const addFavorite = (loc: GeoLocation) => {
    const exists = favorites.some(
      (f) => f.location.latitude === loc.latitude && f.location.longitude === loc.longitude
    );
    if (exists) return;
    const updated = [...favorites, { location: loc }];
    setFavorites(updated);
    localStorage.setItem("favorite-cities", JSON.stringify(updated.map((f) => f.location)));
    setShowAdd(false);
    // Fetch weather for the new one
    fetchWeather(loc).then((weather) => {
      setFavorites((prev) =>
        prev.map((f) =>
          f.location.latitude === loc.latitude ? { ...f, weather } : f
        )
      );
    }).catch(() => {});
  };

  const removeFavorite = (idx: number) => {
    const updated = favorites.filter((_, i) => i !== idx);
    setFavorites(updated);
    localStorage.setItem("favorite-cities", JSON.stringify(updated.map((f) => f.location)));
  };

  if (favorites.length === 0 && !showAdd) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="glass-card rounded-3xl p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star size={14} className="text-accent" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Favorite Cities
            </h3>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 w-full rounded-xl p-3 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
        >
          <Plus size={16} />
          Add cities to compare weather
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card rounded-3xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Star size={14} className="text-accent" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Favorite Cities
          </h3>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-primary hover:text-primary/80 transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2">
              {POPULAR_LOCATIONS.slice(0, 8).map((loc) => {
                const exists = favorites.some(
                  (f) => f.location.latitude === loc.latitude
                );
                return (
                  <button
                    key={`${loc.latitude}-${loc.longitude}`}
                    onClick={() => !exists && addFavorite(loc)}
                    disabled={exists}
                    className="text-left rounded-xl p-2.5 text-xs font-medium hover:bg-secondary/50 transition-colors disabled:opacity-40"
                    style={{ background: "hsl(var(--favorite-bg))" }}
                  >
                    {loc.name}, {loc.countryCode}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {favorites.map((fav, i) => {
          const isActive = currentLocation === fav.location.name;
          return (
            <motion.div
              key={`${fav.location.latitude}-${fav.location.longitude}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-all ${
                isActive ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-secondary/50"
              }`}
              onClick={() => onSelect(fav.location)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{fav.location.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {fav.location.countryCode || fav.location.country}
                  {fav.weather ? ` · ${fav.weather.condition}` : ""}
                </p>
              </div>
              {fav.weather ? (
                <span className="text-lg font-bold">{fav.weather.temp}°</span>
              ) : loadingWeather ? (
                <Loader2 size={14} className="animate-spin text-muted-foreground" />
              ) : null}
              <button
                onClick={(e) => { e.stopPropagation(); removeFavorite(i); }}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
