import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getWeatherByCity,
  getWeatherByCoords,
  WeatherApiError,
  type WeatherPayload,
} from '../../api/weather';
import { BottomNav } from '../../components/layout/BottomNav';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { goToTimelineHome } from '../../utils/tripNavigation';

// Город по умолчанию
const DEFAULT_CITY = 'Тюмень';

export const WeatherPage = () => {
  const navigate = useNavigate();

  // Состояния загрузки и данных
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [cityInput, setCityInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Рефы для управления запросами
  const failedCitiesRef = useRef<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);
  const geoTimeoutRef = useRef<number>();

  // Начальная загрузка погоды
  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;

    let geoFinished = false;

    // Загрузка по названию города
    const loadByCity = async (cityName: string) => {
      try {
        const data = await getWeatherByCity(cityName, signal);
        if (signal.aborted) return;
        setWeather(data);
        setCityInput(data.city);
        setWeatherError(null);
        setInputError(null);
      } catch (error) {
        if (signal.aborted) return;
        if (error instanceof WeatherApiError && error.errorType === 'GEOCODE_NOT_FOUND') {
          setCityInput('');
          setWeather(null);
          setInputError(`Не удалось получить данные для города "${cityName}"`);
        } else {
          setCityInput(cityName);
          setWeather(null);
          setWeatherError('Не удалось получить данные');
        }
      } finally {
        if (!signal.aborted) setInitialLoading(false);
      }
    };

    // Загрузка по координатам
    const loadByCoords = async (lat: number, lon: number) => {
      try {
        const data = await getWeatherByCoords(lat, lon, signal);
        if (signal.aborted) return;
        setWeather(data);
        setCityInput(data.city);
        setWeatherError(null);
        setInputError(null);
      } catch {
        if (signal.aborted) return;
        setCityInput(DEFAULT_CITY);
        setWeather(null);
        setWeatherError('Не удалось получить данные');
      } finally {
        if (!signal.aborted) setInitialLoading(false);
      }
    };

    // Обработчик успешного получения геолокации
    const handleGeoSuccess = (position: GeolocationPosition) => {
      geoFinished = true;
      void loadByCoords(position.coords.latitude, position.coords.longitude);
    };

    // Обработчик ошибки геолокации
    const handleGeoError = () => {
      geoFinished = true;
      void loadByCity(DEFAULT_CITY);
    };

    // Проверка контекста и запуск геолокации
    if (!window.isSecureContext) {
      void loadByCity(DEFAULT_CITY);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handleGeoSuccess, handleGeoError, {
        timeout: 5000,
        enableHighAccuracy: false,
        maximumAge: 60000,
      });

      // Таймаут для геолокации
      geoTimeoutRef.current = window.setTimeout(() => {
        if (!geoFinished) {
          geoFinished = true;
          void loadByCity(DEFAULT_CITY);
        }
      }, 6000);
    } else {
      void loadByCity(DEFAULT_CITY);
    }

    // Очистка при размонтировании
    return () => {
      controller.abort();
      if (geoTimeoutRef.current) clearTimeout(geoTimeoutRef.current);
    };
  }, []);

  // Обработчик изменения поля ввода
  const handleCityInputChange = (value: string) => {
    setCityInput(value);
    if (inputError) setInputError(null);
  };

  // Поиск погоды по городу
  const handleSearch = async () => {
    const query = cityInput.trim();
    if (!query || isFetching) return;

    // Проверка кеша неудачных запросов
    if (failedCitiesRef.current.has(query.toLowerCase())) {
      setInputError(`Не удалось получить данные для города "${query}"`);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;

    setIsFetching(true);
    setInputError(null);

    try {
      const data = await getWeatherByCity(query, signal);
      if (signal.aborted) return;
      failedCitiesRef.current.delete(query.toLowerCase());
      setWeather(data);
      setCityInput(data.city);
      setWeatherError(null);
    } catch (error) {
      if (signal.aborted) return;
      if (error instanceof WeatherApiError && error.errorType === 'GEOCODE_NOT_FOUND') {
        failedCitiesRef.current.add(query.toLowerCase());
        setCityInput('');
        setInputError(`Не удалось получить данные для города "${query}"`);
      } else {
        setCityInput(query);
        setWeatherError('Не удалось получить данные');
      }
    } finally {
      if (!signal.aborted) setIsFetching(false);
    }
  };

  // Обертка страницы с фоном и навигацией
  const pageShell = (content: ReactNode) => (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/images/trips.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="relative z-10 flex min-h-screen flex-col">
        <ScreenHeader
          title="Погода"
          left={
            <button
              type="button"
              onClick={() => goToTimelineHome(navigate)}
              className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black text-2xl text-black"
            >
              ←
            </button>
          }
        />
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 sm:px-6">{content}</div>
        <BottomNav />
      </div>
    </div>
  );

  // Экран начальной загрузки
  if (initialLoading) {
    return pageShell(
      <div className="space-y-4">
        <div className="rounded-xl border border-white/30 bg-white/70 p-4 shadow-md backdrop-blur-sm">
          <div className="h-12 animate-pulse rounded-lg bg-stone-200" />
          <div className="mt-3 h-10 animate-pulse rounded-xl bg-stone-200" />
        </div>
        <div className="rounded-xl border border-white/30 bg-white/70 p-4 shadow-md backdrop-blur-sm">
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-stone-200" />
          <div className="mt-2 h-6 w-1/2 animate-pulse rounded-lg bg-stone-200" />
        </div>
      </div>
    );
  }

  return pageShell(
    <div className="space-y-4">
      {/* Форма поиска города */}
      <div className="rounded-xl border border-white/30 bg-white/70 p-4 shadow-md backdrop-blur-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={cityInput}
            onChange={(e) => handleCityInputChange(e.target.value)}
            disabled={isFetching}
            className="flex-1 rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 focus:ring-2 focus:ring-black/50 disabled:opacity-50"
            placeholder="Введите город"
          />
          <button
            onClick={handleSearch}
            disabled={isFetching}
            className="rounded-2xl bg-black/80 px-4 py-3 font-semibold text-white transition hover:bg-black/90 disabled:opacity-50"
          >
            {isFetching ? '...' : 'Показать'}
          </button>
        </div>
        {inputError && <div className="mt-2 text-sm text-rose-600">{inputError}</div>}
      </div>

      {/* Текущая погода */}
      <div className="rounded-xl border border-white/30 bg-white/70 p-6 shadow-md backdrop-blur-sm">
        {weather ? (
          <>
            <div className="mb-2 text-sm text-stone-600">{weather.city}</div>
            <div className="flex items-center gap-4">
              <div className="text-6xl">{weather.current.emoji}</div>
              <div className="min-w-0">
                <div className="text-5xl font-semibold text-stone-900">{weather.current.temp}°C</div>
                <div className="break-words text-lg text-stone-600">{weather.current.description}</div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-sm text-stone-400">Нет данных о погоде</div>
        )}
        {weatherError && <div className="mt-2 text-sm text-rose-600">{weatherError}</div>}
      </div>

      {/* Прогноз на 3 дня */}
      {weather && weather.forecast && weather.forecast.length > 0 && (
        <div className="rounded-xl border border-white/30 bg-white/70 p-4 shadow-md backdrop-blur-sm">
          <div className="mb-3 text-sm font-semibold text-stone-700">Прогноз на 3 дня</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {weather.forecast.map((day, index) => (
              <div key={index} className="rounded-lg bg-stone-50 p-3 text-center">
                <div className="mb-2 text-sm font-medium text-stone-600">{day.dayName}</div>
                <div className="mb-2 text-3xl">{day.emoji}</div>
                <div className="text-sm text-stone-700">
                  <span className="font-semibold">{day.tempMax}°</span>
                  <span className="mx-1 text-stone-400">/</span>
                  <span className="text-stone-500">{day.tempMin}°</span>
                </div>
                <div className="mt-1 text-xs text-stone-500">{day.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};