import { useState, useCallback, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Crosshair, Loader2, Thermometer, Cloud, Droplets, Wind, Search } from "lucide-react";
import { fetchWeather, searchLocations, type WeatherData, type GeoLocation } from "@/lib/weatherApi";
import WeatherIcon from "./WeatherIcon";
import "leaflet/dist/leaflet.css";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type LayerType = "none" | "clouds" | "precipitation" | "temperature" | "wind";

const LAYERS: { id: LayerType; label: string; icon: React.ReactNode }[] = [
  { id: "none", label: "Base Map", icon: <Map size={14} /> },
  { id: "clouds", label: "Clouds", icon: <Cloud size={14} /> },
  { id: "precipitation", label: "Rain", icon: <Droplets size={14} /> },
  { id: "temperature", label: "Temp", icon: <Thermometer size={14} /> },
  { id: "wind", label: "Wind", icon: <Wind size={14} /> },
];

interface ClickedLocation {
  lat: number;
  lng: number;
  weather: WeatherData | null;
  loading: boolean;
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], Math.max(map.getZoom(), 8), { duration: 1.2 });
  }, [lat, lng, map]);
  return null;
}

interface Props {
  onSelectLocation?: (location: GeoLocation) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function WeatherMapInner({ onSelectLocation, initialLat = 30, initialLng = 0 }: Props) {
  const [activeLayer, setActiveLayer] = useState<LayerType>("none");
  const [clicked, setClicked] = useState<ClickedLocation | null>(null);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoLocation[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();
  const searchRef = useRef<HTMLDivElement>(null);

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setClicked({ lat, lng, weather: null, loading: true });
    setShowSearch(false);
    try {
      const loc: GeoLocation = {
        name: `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
        country: "",
        countryCode: "",
        latitude: lat,
        longitude: lng,
      };
      const weather = await fetchWeather(loc);
      setClicked({ lat, lng, weather, loading: false });
    } catch {
      setClicked({ lat, lng, weather: null, loading: false });
    }
  }, []);

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      const results = await searchLocations(q);
      setSearchResults(results);
      setSearching(false);
    }, 300);
  }, []);

  const handleSearchSelect = (loc: GeoLocation) => {
    setFlyTo({ lat: loc.latitude, lng: loc.longitude });
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
    handleMapClick(loc.latitude, loc.longitude);
    onSelectLocation?.(loc);
  };

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setFlyTo({ lat: latitude, lng: longitude });
      handleMapClick(latitude, longitude);
    });
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Map size={16} className="text-primary" />
          <h3 className="text-sm font-semibold">Global Weather Map</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <Search size={14} className="text-muted-foreground" />
          </button>
          <button
            onClick={handleLocate}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary/80 transition-colors"
            title="My location"
          >
            <Crosshair size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            ref={searchRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border/50 relative z-50"
          >
            <div className="px-4 py-2 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search city or country..."
                className="w-full h-9 rounded-lg bg-secondary/60 px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/40"
                autoFocus
              />
              {searching && (
                <Loader2 size={14} className="absolute right-6 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
              {searchResults.length > 0 && (
                <div className="absolute left-4 right-4 top-full mt-1 z-50 rounded-lg bg-card border border-border shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map((loc, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearchSelect(loc)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-secondary/60 transition-colors flex justify-between"
                    >
                      <span className="font-medium">{loc.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {loc.admin1 ? `${loc.admin1}, ` : ""}{loc.countryCode}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer selector */}
      <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-hide border-b border-border/30">
        {LAYERS.map((layer) => (
          <button
            key={layer.id}
            onClick={() => setActiveLayer(layer.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeLayer === layer.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            {layer.icon}
            {layer.label}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="relative h-[350px] sm:h-[420px] md:h-[480px]">
        <MapContainer
          center={[initialLat, initialLng]}
          zoom={3}
          className="h-full w-full z-0"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />

          {/* Weather overlay layers */}
          {activeLayer === "precipitation" && (
            <TileLayer
              url="https://tilecache.rainviewer.com/v2/radar/nowcast/{z}/{x}/{y}/256/6/1_1.png"
              opacity={0.6}
            />
          )}
          {activeLayer === "clouds" && (
            <TileLayer
              url="https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=b1b15e88fa797225412429c1c50c122a"
              opacity={0.6}
            />
          )}
          {activeLayer === "temperature" && (
            <TileLayer
              url="https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=b1b15e88fa797225412429c1c50c122a"
              opacity={0.6}
            />
          )}
          {activeLayer === "wind" && (
            <TileLayer
              url="https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=b1b15e88fa797225412429c1c50c122a"
              opacity={0.6}
            />
          )}

          <MapClickHandler onClick={handleMapClick} />
          {flyTo && <FlyToLocation lat={flyTo.lat} lng={flyTo.lng} />}

          {/* Clicked location marker */}
          {clicked && (
            <Marker position={[clicked.lat, clicked.lng]}>
              <Popup minWidth={220} maxWidth={280} className="weather-popup">
                {clicked.loading ? (
                  <div className="flex items-center justify-center py-4 gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">Loading weather...</span>
                  </div>
                ) : clicked.weather ? (
                  <div className="p-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">{clicked.weather.location}</p>
                        <p className="text-xs opacity-60">
                          {clicked.weather.admin1 ? `${clicked.weather.admin1}, ` : ""}
                          {clicked.weather.country}
                        </p>
                      </div>
                      <WeatherIcon icon={clicked.weather.icon} size={32} animated={false} />
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-2xl font-bold">{clicked.weather.temp}°</span>
                      <span className="text-xs opacity-60">{clicked.weather.condition}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs opacity-70">
                      <div className="flex justify-between">
                        <span>Humidity</span>
                        <span className="font-medium">{clicked.weather.humidity}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Wind</span>
                        <span className="font-medium">{clicked.weather.windSpeed} km/h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pressure</span>
                        <span className="font-medium">{clicked.weather.pressure} hPa</span>
                      </div>
                      <div className="flex justify-between">
                        <span>UV Index</span>
                        <span className="font-medium">{clicked.weather.uvIndex}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Feels like</span>
                        <span className="font-medium">{clicked.weather.feelsLike}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Visibility</span>
                        <span className="font-medium">{clicked.weather.visibility} km</span>
                      </div>
                    </div>
                    {onSelectLocation && (
                      <button
                        onClick={() =>
                          onSelectLocation({
                            name: clicked.weather!.location,
                            country: clicked.weather!.country,
                            countryCode: "",
                            admin1: clicked.weather!.admin1,
                            latitude: clicked.lat,
                            longitude: clicked.lng,
                          })
                        }
                        className="mt-2 w-full py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                      >
                        View Full Details
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm opacity-60 py-2">Unable to load weather data</p>
                )}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Attribution */}
      <div className="px-4 py-1.5 text-[10px] text-muted-foreground border-t border-border/30">
        Map © CARTO · Weather © Open-Meteo · Radar © RainViewer
      </div>
    </motion.div>
  );
}
