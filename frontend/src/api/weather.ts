import api from './client';

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
  current: {
    temp: number;
    icon: string;
    description: string;
    emoji: string;
  };
  forecast: DailyForecast[];
  source: 'openweathermap' | 'stub';
};

export type WeatherErrorType = 'GEOCODE_NOT_FOUND' | 'WEATHER_FETCH_FAILED' | 'INVALID_COORDS' | 'UNKNOWN';

export class WeatherApiError extends Error {
  errorType: WeatherErrorType;
  city?: string;

  constructor(errorType: WeatherErrorType, message: string, city?: string) {
    super(message);
    this.name = 'WeatherApiError';
    this.errorType = errorType;
    this.city = city;
  }
}

const toWeatherApiError = (error: any): WeatherApiError => {
  const payload = error?.response?.data;
  if (payload?.errorType) {
    return new WeatherApiError(payload.errorType, payload.message ?? 'Ошибка запроса погоды', payload.city);
  }
  return new WeatherApiError('UNKNOWN', 'Не удалось получить данные о погоде');
};

export const getWeatherByCity = async (city: string, signal?: AbortSignal): Promise<WeatherPayload> => {
  try {
    const response = await api.get<WeatherPayload>('/api/weather', { params: { city }, signal });
    return response.data;
  } catch (error) {
    throw toWeatherApiError(error);
  }
};

export const getWeatherByCoords = async (
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<WeatherPayload> => {
  try {
    const response = await api.get<WeatherPayload>('/api/weather', { params: { lat, lon }, signal });
    return response.data;
  } catch (error) {
    throw toWeatherApiError(error);
  }
};