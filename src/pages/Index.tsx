import { useState, useEffect, useCallback, useRef } from "react";
import { fetchWeather, type WeatherData, type GeoLocation, POPULAR_LOCATIONS } from "@/lib/weatherApi";
import SearchBar from "@/components/weather/SearchBar";
import CurrentWeather from "@/components/weather/CurrentWeather";
import HourlyForecast from "@/components/weather/HourlyForecast";
import WeeklyForecast from "@/components/weather/WeeklyForecast";
import WeatherDetails from "@/components/weather/WeatherDetails";
import TemperatureChart from "@/components/weather/TemperatureChart";
import HumidityWindChart from "@/components/weather/HumidityWindChart";
import ThemeToggle from "@/components/weather/ThemeToggle";
import RecentSearches from "@/components/weather/RecentSearches";
import AnimatedBackground from "@/components/weather/AnimatedBackground";
import SunPath from "@/components/weather/SunPath";
import AirQuality from "@/components/weather/AirQuality";
import SmartWidgets from "@/components/weather/SmartWidgets";
import WeatherInsights from "@/components/weather/WeatherInsights";
import WeatherAlerts from "@/components/weather/WeatherAlerts";
import FavoriteCities from "@/components/weather/FavoriteCities";
import WeatherMap from "@/components/weather/WeatherMap";
import { AnimatePresence, motion } from "framer-motion";
import { CloudSun, Loader2, AlertCircle, RefreshCw } from "lucide-react";

interface StoredLocation {
  label: string;
  location: GeoLocation;
}

const Index = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("theme") === "dark"; } catch { return false; }
  });
  const [isLocating, setIsLocating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GeoLocation>(POPULAR_LOCATIONS[0]);
  const [refreshing, setRefreshing] = useState(false);
  const [recent, setRecent] = useState<StoredLocation[]>(() => {
    try { return JSON.parse(localStorage.getItem("recent-weather") || "[]"); } catch { return []; }
  });

  const contentRef = useRef<HTMLDivElement>(null);
  const lastFetchRef = useRef<number>(0);

  const loadWeather = useCallback(async (location: GeoLocation, isRefresh = false) => {
    // Debounce: don't fetch if less than 2s since last fetch
    const now = Date.now();
    if (now - lastFetchRef.current < 2000 && !isRefresh) return;
    lastFetchRef.current = now;

    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    setCurrentLocation(location);
    try {
      const data = await fetchWeather(location);
      setWeather(data);
      // Cache for offline
      try { localStorage.setItem("cached-weather", JSON.stringify(data)); } catch {}
    } catch (e) {
      console.error("Failed to fetch weather:", e);
      // Try cached data
      try {
        const cached = localStorage.getItem("cached-weather");
        if (cached && !weather) {
          setWeather(JSON.parse(cached));
          setError("Showing cached data. Pull to refresh.");
        } else {
          setError("Failed to fetch weather data. Please try again.");
        }
      } catch {
        setError("Failed to fetch weather data. Please try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWeather(POPULAR_LOCATIONS[0]);
  }, [loadWeather]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const handleSelect = (location: GeoLocation) => {
    loadWeather(location);
    const label = `${location.name}, ${location.countryCode || location.country}`;
    setRecent((prev) => {
      const updated = [{ label, location }, ...prev.filter((x) => x.label !== label)].slice(0, 5);
      localStorage.setItem("recent-weather", JSON.stringify(updated));
      return updated;
    });
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc: GeoLocation = {
          name: "Your Location", country: "", countryCode: "",
          latitude: pos.coords.latitude, longitude: pos.coords.longitude,
        };
        try {
          const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${pos.coords.latitude.toFixed(1)}&count=1`
          );
          const data = await res.json();
          if (data.results?.[0]) {
            loc.name = data.results[0].name;
            loc.country = data.results[0].country || "";
            loc.countryCode = data.results[0].country_code || "";
            loc.admin1 = data.results[0].admin1;
          }
        } catch {}
        handleSelect(loc);
        setIsLocating(false);
      },
      () => {
        setError("Unable to get your location.");
        setIsLocating(false);
      }
    );
  };

  const handleRefresh = () => loadWeather(currentLocation, true);

  return (
    <div className="min-h-screen relative transition-colors duration-700">
      {/* Dynamic animated background */}
      {weather && <AnimatedBackground icon={weather.icon} isDay={weather.isDay} />}

      <div ref={contentRef} className="relative z-10 container mx-auto max-w-7xl px-4 py-6 md:py-10 lg:px-6 xl:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6 sticky top-0 z-40 py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
          style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
        >
          <div className="flex items-center gap-2.5">
            <CloudSun size={26} className="text-primary" />
            <h1 className="text-lg font-bold tracking-tight">Weather</h1>
          </div>
          <div className="flex items-center gap-2">
            {weather && !loading && (
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="glass-card flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-primary/10"
              >
                <RefreshCw size={16} className={`text-foreground ${refreshing ? "animate-spin" : ""}`} />
              </button>
            )}
            <ThemeToggle dark={dark} onToggle={() => setDark(!dark)} />
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-3 mb-8"
        >
          <SearchBar onSelect={handleSelect} onLocate={handleLocate} isLocating={isLocating} />
          <RecentSearches
            searches={recent.map((r) => r.label)}
            onSelect={(label) => {
              const found = recent.find((r) => r.label === label);
              if (found) handleSelect(found.location);
            }}
            onRemove={(label) =>
              setRecent((prev) => {
                const updated = prev.filter((x) => x.label !== label);
                localStorage.setItem("recent-weather", JSON.stringify(updated));
                return updated;
              })
            }
          />
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-4"
            >
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-2 border-primary/20" />
                <Loader2 size={48} className="absolute inset-0 animate-spin text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Fetching weather for {currentLocation.name}...
              </p>
            </motion.div>
          ) : error && !weather ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-4"
            >
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle size={32} className="text-destructive" />
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-xs">{error}</p>
              <button
                onClick={() => loadWeather(currentLocation)}
                className="text-sm font-medium text-primary hover:underline"
              >
                Try again
              </button>
            </motion.div>
          ) : weather ? (
            <motion.div
              key={`${weather.location}-${weather.country}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-4"
            >
              {/* Severe weather alerts */}
              <WeatherAlerts data={weather} />

              {/* Current weather hero */}
              <CurrentWeather data={weather} />

              {/* Global Weather Map */}
              <WeatherMap
                onSelectLocation={handleSelect}
                initialLat={weather.latitude}
                initialLng={weather.longitude}
              />

              {/* Hourly */}
              <HourlyForecast hours={weather.hourly} />

              {/* Grid: Weekly + Chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <WeeklyForecast days={weather.daily} />
                <TemperatureChart hours={weather.hourly} />
              </div>

              {/* Smart widgets grid */}
              <SmartWidgets data={weather} />

              {/* Details row */}
              <WeatherDetails data={weather} />

              {/* Grid: Sun Path + AQI */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <SunPath
                  sunrise={weather.sunrise}
                  sunset={weather.sunset}
                  sunriseTimestamp={weather.sunriseTimestamp}
                  sunsetTimestamp={weather.sunsetTimestamp}
                />
                {weather.airQuality && <AirQuality data={weather.airQuality} />}
              </div>

              {/* Wind & Precipitation chart */}
              <HumidityWindChart days={weather.daily} />

              {/* Weather Insights */}
              <WeatherInsights data={weather} />

              {/* Favorite Cities */}
              <FavoriteCities
                onSelect={handleSelect}
                currentLocation={weather.location}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-[11px] sm:text-xs text-muted-foreground mt-10 pb-6"
        >
          Powered by Open-Meteo · Real-time global weather data
        </motion.p>
      </div>
    </div>
  );
};

export default Index;
