import { useMemo } from "react";

interface Props {
  icon: string;
  isDay: boolean;
}

export default function AnimatedBackground({ icon, isDay }: Props) {
  const bgClass = useMemo(() => {
    if (!isDay) return "page-bg-night";
    if (icon === "sunny" || icon === "partly-cloudy") return "page-bg-sunny";
    if (icon === "cloudy" || icon === "foggy") return "page-bg-cloudy";
    if (icon === "rainy" || icon === "drizzle" || icon === "thunderstorm") return "page-bg-rainy";
    if (icon === "snow") return "page-bg-snow";
    return "page-bg-sunny";
  }, [icon, isDay]);

  const showRain = icon === "rainy" || icon === "drizzle" || icon === "thunderstorm";
  const showSnow = icon === "snow";

  return (
    <>
      <div className={`fixed inset-0 ${bgClass} transition-all duration-1000 -z-10`} />
      
      {showRain && (
        <div className="rain-overlay">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="raindrop"
              style={{
                left: `${Math.random() * 100}%`,
                height: `${15 + Math.random() * 25}px`,
                animationDuration: `${0.6 + Math.random() * 0.8}s`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: 0.3 + Math.random() * 0.4,
              }}
            />
          ))}
        </div>
      )}

      {showSnow && (
        <div className="rain-overlay">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="snowflake"
              style={{
                left: `${Math.random() * 100}%`,
                width: `${3 + Math.random() * 4}px`,
                height: `${3 + Math.random() * 4}px`,
                animationDuration: `${3 + Math.random() * 4}s`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: 0.4 + Math.random() * 0.5,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
