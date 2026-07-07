export const DEFAULT_CITY = 'Тюмень';

export type CurrentWeather = {
  temp: number;
  icon: string;
  description: string;
  emoji: string;
};

export type DailyForecast = {
  date: string;
  dayName: string;
  tempMin: number;
  tempMax: number;
  description: string;
  emoji: string;
};

export type WeatherPayload = {
  city: string;
  current: CurrentWeather;
  forecast: DailyForecast[];
  source: 'openweathermap' | 'stub';
};

export class GeocodeNotFoundError extends Error {
  cityQuery: string;
  constructor(cityQuery: string) {
    super(`Город "${cityQuery}" не найден`);
    this.name = 'GeocodeNotFoundError';
    this.cityQuery = cityQuery;
  }
}

export class WeatherFetchError extends Error {
  cityName: string;
  constructor(cityName: string) {
    super(`Не удалось получить данные о погоде для города "${cityName}"`);
    this.name = 'WeatherFetchError';
    this.cityName = cityName;
  }
}

// Кэш в памяти: ключ = "lat,lon", значение = { payload, timestamp }
const weatherCache = new Map<string, { payload: WeatherPayload; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 минут

const getWeatherEmoji = (main: string, description: string): string => {
  const mainLower = main.toLowerCase();
  const descLower = description.toLowerCase();

  if (mainLower === 'clear') return '☀️';
  if (mainLower === 'clouds') {
    if (descLower.includes('перемен')) return '⛅';
    if (descLower.includes('ясно')) return '️';
    return '☁️';
  }
  if (mainLower === 'rain') return '🌧️';
  if (mainLower === 'drizzle') return '🌦️';
  if (mainLower === 'thunderstorm') return '⛈️';
  if (mainLower === 'snow') return '❄️';
  if (mainLower === 'mist' || mainLower === 'fog' || mainLower === 'smoke' || mainLower === 'haze') return '️';

  return '🌡️';
};

const getDayName = (dateStr: string): string => {
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const date = new Date(dateStr);
  return days[date.getDay()];
};

const buildStub = (cityName: string): WeatherPayload => ({
  city: cityName,
  current: {
    temp: 22,
    icon: '01d',
    description: 'Ясно (заглушка)',
    emoji: '☀️',
  },
  forecast: [],
  source: 'stub',
});

type GeocodeResult = {
  lat: number;
  lon: number;
  name: string;
};

const geocodeCity = async (cityQuery: string, apiKey: string): Promise<GeocodeResult> => {
  const url = new URL('https://api.openweathermap.org/geo/1.0/direct');
  url.searchParams.set('q', cityQuery);
  url.searchParams.set('limit', '1');
  url.searchParams.set('appid', apiKey);
  const response = await fetch(url);
  if (!response.ok) {
    throw new GeocodeNotFoundError(cityQuery);
  }
  const results: any[] = await response.json();
  if (!Array.isArray(results) || results.length === 0) {
    throw new GeocodeNotFoundError(cityQuery);
  }
  const [{ lat, lon, local_names, name }] = results;
  return { lat, lon, name: local_names?.ru ?? name };
};

const fetchWeatherByCoords = async (
  lat: number,
  lon: number,
  apiKey: string,
): Promise<WeatherPayload> => {
  // Проверяем кэш
  const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.payload;
  }

  // Параллельные запросы вместо последовательных
  const currentUrl = new URL('https://api.openweathermap.org/data/2.5/weather');
  currentUrl.searchParams.set('lat', String(lat));
  currentUrl.searchParams.set('lon', String(lon));
  currentUrl.searchParams.set('units', 'metric');
  currentUrl.searchParams.set('lang', 'ru');
  currentUrl.searchParams.set('appid', apiKey);

  const forecastUrl = new URL('https://api.openweathermap.org/data/2.5/forecast');
  forecastUrl.searchParams.set('lat', String(lat));
  forecastUrl.searchParams.set('lon', String(lon));
  forecastUrl.searchParams.set('units', 'metric');
  forecastUrl.searchParams.set('lang', 'ru');
  forecastUrl.searchParams.set('appid', apiKey);

  const [currentResponse, forecastResponse] = await Promise.all([
    fetch(currentUrl),
    fetch(forecastUrl),
  ]);

  if (!currentResponse.ok) {
    throw new Error('weather request failed');
  }
  const currentJson: any = await currentResponse.json();

  const forecast: DailyForecast[] = [];
  if (forecastResponse.ok) {
    try {
      const forecastJson: any = await forecastResponse.json();
      const dailyData: { [key: string]: any[] } = {};

      forecastJson.list.forEach((item: any) => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyData[date]) {
          dailyData[date] = [];
        }
        dailyData[date].push(item);
      });

      const dates = Object.keys(dailyData).slice(1, 4);

      dates.forEach((date) => {
        const dayItems = dailyData[date];
        const temps = dayItems.map((item: any) => item.main.temp);
        const mainWeather = dayItems[0].weather[0];

        forecast.push({
          date,
          dayName: getDayName(date),
          tempMin: Math.round(Math.min(...temps)),
          tempMax: Math.round(Math.max(...temps)),
          description: mainWeather.description,
          emoji: getWeatherEmoji(mainWeather.main, mainWeather.description),
        });
      });
    } catch {
      // Прогноз не критичен
    }
  }

  const mainWeather = currentJson.weather?.[0];

  const payload: WeatherPayload = {
    city: currentJson.name,
    current: {
      temp: Math.round(currentJson.main.temp),
      icon: mainWeather?.icon ?? '01d',
      description: mainWeather?.description ?? 'Без описания',
      emoji: getWeatherEmoji(mainWeather?.main ?? 'Clear', mainWeather?.description ?? ''),
    },
    forecast,
    source: 'openweathermap',
  };

  // Сохраняем в кэш
  weatherCache.set(cacheKey, { payload, timestamp: Date.now() });

  return payload;
};

export const getWeatherByCoords = async (
  lat: number,
  lon: number,
  fallbackCityName: string,
): Promise<WeatherPayload> => {
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    return buildStub(fallbackCityName);
  }
  try {
    return await fetchWeatherByCoords(lat, lon, apiKey);
  } catch {
    throw new WeatherFetchError(fallbackCityName);
  }
};

export const getWeatherByCityName = async (cityQuery: string): Promise<WeatherPayload> => {
  const trimmed = cityQuery.trim() || DEFAULT_CITY;
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    return buildStub(trimmed);
  }
  const geo = await geocodeCity(trimmed, apiKey);
  return getWeatherByCoords(geo.lat, geo.lon, geo.name);
};