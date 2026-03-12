import { lazy, Suspense } from "react";
import { Loader2, Map } from "lucide-react";
import type { GeoLocation } from "@/lib/weatherApi";

const WeatherMapInner = lazy(() => import("./WeatherMapInner"));

interface Props {
  onSelectLocation?: (location: GeoLocation) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function WeatherMap(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
            <Map size={16} className="text-primary" />
            <h3 className="text-sm font-semibold">Global Weather Map</h3>
          </div>
          <div className="h-[350px] sm:h-[420px] md:h-[480px] flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        </div>
      }
    >
      <WeatherMapInner {...props} />
    </Suspense>
  );
}
