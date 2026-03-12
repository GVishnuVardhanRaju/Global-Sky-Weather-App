// Open-Meteo API - Free, no API key required, global coverage

export interface GeoLocation {
  name: string;
  country: string;
  countryCode: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export interface HourlyData {
  time: string;
  temp: number;
  icon: string;
  condition: string;
  precipProb: number;
}

export interface DailyData {
  day: string;
  date: string;
  high: number;
  low: number;
  icon: string;
  condition: string;
  precipitation: number;
  precipProb: number;
  windSpeed: number;
  uvIndex: number;
}

export interface AirQualityData {
  aqi: number;
  pm25: number;
  pm10: number;
  level: "Good" | "Moderate" | "Unhealthy for Sensitive" | "Unhealthy" | "Very Unhealthy" | "Hazardous";
  recommendation: string;
  color: string;
}

export interface WeatherData {
  location: string;
  country: string;
  admin1?: string;
  temp: number;
  feelsLike: number;
  condition: string;
  icon: string;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  dewPoint: number;
  precipProb: number;
  cloudCover: number;
  sunrise: string;
  sunset: string;
  sunriseTimestamp: number;
  sunsetTimestamp: number;
  hourly: HourlyData[];
  daily: DailyData[];
  isDay: boolean;
  airQuality?: AirQualityData;
  latitude: number;
  longitude: number;
}

function wmoToCondition(code: number, isDay: boolean): { condition: string; icon: string } {
  if (code === 0) return { condition: "Clear Sky", icon: isDay ? "sunny" : "night" };
  if (code === 1) return { condition: "Mainly Clear", icon: isDay ? "sunny" : "night" };
  if (code === 2) return { condition: "Partly Cloudy", icon: "partly-cloudy" };
  if (code === 3) return { condition: "Overcast", icon: "cloudy" };
  if (code >= 45 && code <= 48) return { condition: "Foggy", icon: "foggy" };
  if (code >= 51 && code <= 55) return { condition: "Drizzle", icon: "drizzle" };
  if (code >= 56 && code <= 57) return { condition: "Freezing Drizzle", icon: "drizzle" };
  if (code >= 61 && code <= 65) return { condition: "Rain", icon: "rainy" };
  if (code >= 66 && code <= 67) return { condition: "Freezing Rain", icon: "rainy" };
  if (code >= 71 && code <= 77) return { condition: "Snow", icon: "snow" };
  if (code >= 80 && code <= 82) return { condition: "Rain Showers", icon: "rainy" };
  if (code >= 85 && code <= 86) return { condition: "Snow Showers", icon: "snow" };
  if (code >= 95) return { condition: "Thunderstorm", icon: "thunderstorm" };
  return { condition: "Unknown", icon: "cloudy" };
}

function windDegToDir(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

function getAqiLevel(aqi: number): AirQualityData["level"] {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

function getAqiRecommendation(level: AirQualityData["level"]): string {
  switch (level) {
    case "Good": return "Air quality is satisfactory. Enjoy outdoor activities!";
    case "Moderate": return "Acceptable quality. Sensitive individuals should limit prolonged outdoor exertion.";
    case "Unhealthy for Sensitive": return "Sensitive groups should reduce outdoor activity.";
    case "Unhealthy": return "Everyone may experience health effects. Limit outdoor exertion.";
    case "Very Unhealthy": return "Health alert! Avoid prolonged outdoor activities.";
    case "Hazardous": return "Emergency conditions. Stay indoors and keep windows closed.";
  }
}

function getAqiColor(level: AirQualityData["level"]): string {
  switch (level) {
    case "Good": return "aqi-good";
    case "Moderate": return "aqi-moderate";
    case "Unhealthy for Sensitive": return "aqi-unhealthy";
    default: return "aqi-hazardous";
  }
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export async function searchLocations(query: string): Promise<GeoLocation[]> {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`
    );
    const data = await res.json();
    if (!data.results) return [];
    return data.results.map((r: any) => ({
      name: r.name,
      country: r.country || "",
      countryCode: r.country_code || "",
      admin1: r.admin1,
      latitude: r.latitude,
      longitude: r.longitude,
    }));
  } catch (e) {
    console.error("Geocoding error:", e);
    return [];
  }
}

async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityData | undefined> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: "us_aqi,pm2_5,pm10",
    });
    const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${params}`);
    const data = await res.json();
    if (!data.current) return undefined;
    const aqi = Math.round(data.current.us_aqi ?? 0);
    const level = getAqiLevel(aqi);
    return {
      aqi,
      pm25: Math.round((data.current.pm2_5 ?? 0) * 10) / 10,
      pm10: Math.round((data.current.pm10 ?? 0) * 10) / 10,
      level,
      recommendation: getAqiRecommendation(level),
      color: getAqiColor(level),
    };
  } catch {
    return undefined;
  }
}

export async function fetchWeather(location: GeoLocation): Promise<WeatherData> {
  const { latitude, longitude } = location;

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: [
      "temperature_2m", "relative_humidity_2m", "apparent_temperature",
      "is_day", "weather_code", "surface_pressure", "wind_speed_10m",
      "wind_direction_10m", "uv_index", "dew_point_2m", "precipitation",
      "cloud_cover"
    ].join(","),
    hourly: "temperature_2m,weather_code,is_day,precipitation_probability",
    daily: [
      "weather_code", "temperature_2m_max", "temperature_2m_min",
      "sunrise", "sunset", "precipitation_sum", "precipitation_probability_max",
      "wind_speed_10m_max", "uv_index_max"
    ].join(","),
    timezone: "auto",
    forecast_days: "7",
  });

  const [weatherRes, aqiData] = await Promise.all([
    fetch(`https://api.open-meteo.com/v1/forecast?${params}`),
    fetchAirQuality(latitude, longitude),
  ]);

  const data = await weatherRes.json();
  const current = data.current;
  const isDay = current.is_day === 1;
  const { condition, icon } = wmoToCondition(current.weather_code, isDay);

  const nowIdx = data.hourly.time.findIndex((t: string) => {
    const diff = new Date(t).getTime() - Date.now();
    return diff >= -1800000;
  });
  const startIdx = Math.max(0, nowIdx);

  const hourly: HourlyData[] = data.hourly.time
    .slice(startIdx, startIdx + 24)
    .map((t: string, i: number) => {
      const idx = startIdx + i;
      const hourIsDay = data.hourly.is_day[idx] === 1;
      const hCondition = wmoToCondition(data.hourly.weather_code[idx], hourIsDay);
      const d = new Date(t);
      return {
        time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        temp: Math.round(data.hourly.temperature_2m[idx]),
        icon: hCondition.icon,
        condition: hCondition.condition,
        precipProb: data.hourly.precipitation_probability?.[idx] ?? 0,
      };
    });

  const daily: DailyData[] = data.daily.time.map((t: string, i: number) => {
    const d = new Date(t);
    const dCondition = wmoToCondition(data.daily.weather_code[i], true);
    return {
      day: i === 0 ? "Today" : dayNames[d.getDay()],
      date: d.toLocaleDateString([], { month: "short", day: "numeric" }),
      high: Math.round(data.daily.temperature_2m_max[i]),
      low: Math.round(data.daily.temperature_2m_min[i]),
      icon: dCondition.icon,
      condition: dCondition.condition,
      precipitation: Math.round(data.daily.precipitation_sum[i] * 10) / 10,
      precipProb: data.daily.precipitation_probability_max?.[i] ?? 0,
      windSpeed: Math.round(data.daily.wind_speed_10m_max?.[i] ?? 0),
      uvIndex: Math.round(data.daily.uv_index_max?.[i] ?? 0),
    };
  });

  const sunriseTimestamp = new Date(data.daily.sunrise[0]).getTime();
  const sunsetTimestamp = new Date(data.daily.sunset[0]).getTime();
  const sunrise = new Date(sunriseTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const sunset = new Date(sunsetTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return {
    location: location.name,
    country: location.country,
    admin1: location.admin1,
    temp: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    condition,
    icon,
    weatherCode: current.weather_code,
    humidity: Math.round(current.relative_humidity_2m),
    windSpeed: Math.round(current.wind_speed_10m),
    windDirection: windDegToDir(current.wind_direction_10m),
    pressure: Math.round(current.surface_pressure),
    visibility: 10,
    uvIndex: Math.round(current.uv_index ?? 0),
    dewPoint: Math.round(current.dew_point_2m ?? 0),
    precipProb: hourly[0]?.precipProb ?? 0,
    cloudCover: current.cloud_cover ?? 0,
    sunrise,
    sunset,
    sunriseTimestamp,
    sunsetTimestamp,
    hourly,
    daily,
    isDay,
    airQuality: aqiData,
    latitude,
    longitude,
  };
}

export function getMoonPhase(): { name: string; emoji: string; illumination: number } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  // Simple moon phase calculation
  const c = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day - 1524.5;
  const jd = c;
  const daysSinceNew = ((jd - 2451550.1) % 29.530588853);
  const phase = ((daysSinceNew + 29.530588853) % 29.530588853) / 29.530588853;
  const illumination = Math.round(Math.abs(phase < 0.5 ? phase * 2 : (1 - phase) * 2) * 100);

  if (phase < 0.03 || phase > 0.97) return { name: "New Moon", emoji: "🌑", illumination: 0 };
  if (phase < 0.22) return { name: "Waxing Crescent", emoji: "🌒", illumination };
  if (phase < 0.28) return { name: "First Quarter", emoji: "🌓", illumination: 50 };
  if (phase < 0.47) return { name: "Waxing Gibbous", emoji: "🌔", illumination };
  if (phase < 0.53) return { name: "Full Moon", emoji: "🌕", illumination: 100 };
  if (phase < 0.72) return { name: "Waning Gibbous", emoji: "🌖", illumination };
  if (phase < 0.78) return { name: "Last Quarter", emoji: "🌗", illumination: 50 };
  return { name: "Waning Crescent", emoji: "🌘", illumination };
}

export function generateInsights(data: WeatherData): string[] {
  const insights: string[] = [];

  if (data.precipProb > 60) insights.push("🌧️ High chance of rain — carry an umbrella today.");
  else if (data.precipProb > 30) insights.push("🌦️ Some chance of rain. Consider bringing a light jacket.");
  
  if (data.uvIndex >= 8) insights.push("☀️ Very high UV index — wear sunscreen and protective clothing.");
  else if (data.uvIndex >= 5) insights.push("🧴 Moderate UV — sunscreen recommended for extended outdoor time.");
  
  if (data.temp >= 35) insights.push("🥵 Extreme heat warning. Stay hydrated and avoid prolonged sun exposure.");
  else if (data.temp <= 0) insights.push("🥶 Freezing temperatures. Bundle up and watch for ice.");
  
  if (data.windSpeed > 40) insights.push("💨 Strong winds expected. Secure loose outdoor items.");
  
  if (data.humidity > 80) insights.push("💧 Very high humidity. Activities may feel more strenuous.");
  
  if (data.feelsLike < data.temp - 5) insights.push("🌡️ Feels much colder than actual temperature due to wind chill.");
  
  if (data.airQuality && data.airQuality.aqi > 100) {
    insights.push(`😷 Poor air quality (AQI: ${data.airQuality.aqi}). Limit outdoor activities.`);
  }

  // Temperature change insights
  if (data.daily.length >= 2) {
    const tomorrow = data.daily[1];
    const diff = tomorrow.high - data.temp;
    if (diff < -5) insights.push(`📉 Temperature dropping to ${tomorrow.high}° tomorrow.`);
    else if (diff > 5) insights.push(`📈 Warming up to ${tomorrow.high}° tomorrow.`);
  }

  if (data.isDay) {
    const now = Date.now();
    const remaining = data.sunsetTimestamp - now;
    if (remaining > 0 && remaining < 3600000) {
      insights.push("🌅 Sunset approaching within the next hour.");
    }
  }

  if (insights.length === 0) {
    insights.push("✨ Pleasant weather conditions. Great day to be outside!");
  }

  return insights.slice(0, 5);
}

export function getSevereAlerts(data: WeatherData): string[] {
  const alerts: string[] = [];
  const code = data.weatherCode;
  
  if (code >= 95) alerts.push("⛈️ Thunderstorm Warning: Severe thunderstorm activity detected.");
  if (data.temp >= 40) alerts.push("🔥 Extreme Heat Alert: Dangerously high temperatures.");
  if (data.temp <= -15) alerts.push("❄️ Extreme Cold Alert: Dangerously low temperatures.");
  if (data.windSpeed > 60) alerts.push("🌪️ High Wind Warning: Potential for damaging winds.");
  if (data.daily.some(d => d.precipitation > 50)) alerts.push("🌊 Heavy Rain Alert: Risk of flooding.");
  if (code >= 71 && code <= 77 && data.windSpeed > 30) alerts.push("🌨️ Blizzard Warning: Heavy snow with strong winds.");
  
  return alerts;
}

export const POPULAR_LOCATIONS: GeoLocation[] = [
  { name: "Bengaluru", country: "India", countryCode: "IN", admin1: "Karnataka", latitude: 12.9716, longitude: 77.5946 },
  { name: "London", country: "United Kingdom", countryCode: "GB", admin1: "England", latitude: 51.5074, longitude: -0.1278 },
  { name: "Tokyo", country: "Japan", countryCode: "JP", admin1: "Tokyo", latitude: 35.6762, longitude: 139.6503 },
  { name: "Paris", country: "France", countryCode: "FR", admin1: "Île-de-France", latitude: 48.8566, longitude: 2.3522 },
  { name: "Sydney", country: "Australia", countryCode: "AU", admin1: "New South Wales", latitude: -33.8688, longitude: 151.2093 },
  { name: "Dubai", country: "United Arab Emirates", countryCode: "AE", latitude: 25.2048, longitude: 55.2708 },
  { name: "Mumbai", country: "India", countryCode: "IN", admin1: "Maharashtra", latitude: 19.076, longitude: 72.8777 },
  { name: "São Paulo", country: "Brazil", countryCode: "BR", admin1: "São Paulo", latitude: -23.5505, longitude: -46.6333 },
  { name: "Cairo", country: "Egypt", countryCode: "EG", latitude: 30.0444, longitude: 31.2357 },
  { name: "Beijing", country: "China", countryCode: "CN", latitude: 39.9042, longitude: 116.4074 },
  { name: "Moscow", country: "Russia", countryCode: "RU", latitude: 55.7558, longitude: 37.6173 },
  { name: "Lagos", country: "Nigeria", countryCode: "NG", latitude: 6.5244, longitude: 3.3792 },
  { name: "Berlin", country: "Germany", countryCode: "DE", latitude: 52.52, longitude: 13.405 },
  { name: "Singapore", country: "Singapore", countryCode: "SG", latitude: 1.3521, longitude: 103.8198 },
  { name: "Seoul", country: "South Korea", countryCode: "KR", latitude: 37.5665, longitude: 126.978 },
  { name: "Mexico City", country: "Mexico", countryCode: "MX", latitude: 19.4326, longitude: -99.1332 },
  { name: "Bangkok", country: "Thailand", countryCode: "TH", latitude: 13.7563, longitude: 100.5018 },
  { name: "Istanbul", country: "Turkey", countryCode: "TR", latitude: 41.0082, longitude: 28.9784 },
  { name: "Nairobi", country: "Kenya", countryCode: "KE", latitude: -1.2921, longitude: 36.8219 },
  { name: "Toronto", country: "Canada", countryCode: "CA", admin1: "Ontario", latitude: 43.6532, longitude: -79.3832 },
];
