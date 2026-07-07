import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWeatherByCity, getWeatherByCoords, WeatherApiError, type WeatherPayload } from '../../api/weather';

const DEFAULT_CITY = 'Тюмень';

export const WeatherPage = () => {
  const navigate = useNavigate();

  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [cityInput, setCityInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const failedCitiesRef = useRef<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);
  const geoTimeoutRef = useRef<number>();

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;

    let geoFinished = false;

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

    const loadByCoords = async (lat: number, lon: number) => {
      try {
        const data = await getWeatherByCoords(lat, lon, signal);
        if (signal.aborted) return;
        setWeather(data);
        setCityInput(data.city);
      } catch {
        if (signal.aborted) return;
        setCityInput(DEFAULT_CITY);
        setWeather(null);
        setWeatherError('Не удалось получить данные');
      } finally {
        if (!signal.aborted) setInitialLoading(false);
      }
    };

    const handleGeoSuccess = (position: GeolocationPosition) => {
      geoFinished = true;
      void loadByCoords(position.coords.latitude, position.coords.longitude);
    };

    const handleGeoError = () => {
      geoFinished = true;
      void loadByCity(DEFAULT_CITY);
    };

    if (!window.isSecureContext) {
      void loadByCity(DEFAULT_CITY);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handleGeoSuccess, handleGeoError, {
        timeout: 5000,
        enableHighAccuracy: false,
        maximumAge: 60000,
      });

      geoTimeoutRef.current = window.setTimeout(() => {
        if (!geoFinished) {
          geoFinished = true;
          void loadByCity(DEFAULT_CITY);
        }
      }, 6000);
    } else {
      void loadByCity(DEFAULT_CITY);
    }

    return () => {
      controller.abort();
      if (geoTimeoutRef.current) clearTimeout(geoTimeoutRef.current);
    };
  }, []);

  const handleCityInputChange = (value: string) => {
    setCityInput(value);
    if (inputError) setInputError(null);
  };

  const handleSearch = async () => {
    const query = cityInput.trim();
    if (!query || isFetching) return;

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

  const handleClose = () => navigate(-1);

  if (initialLoading) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          backgroundImage: "url('/images/trips.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="px-6 pt-6 pb-2 flex justify-between items-center">
            <button
              onClick={handleClose}
              className="font-bold text-center rounded-xl"
              style={{
                fontSize: "28px",
                color: "black",
                backgroundColor: "transparent",
                border: "3px solid black",
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ←
            </button>
            <div
              className="font-bold text-center px-10 py-1 rounded-xl"
              style={{
                fontSize: "22px",
                lineHeight: "28px",
                color: "black",
                backgroundColor: "transparent",
                border: "3px solid black",
                display: "inline-block",
                height: "48px",
              }}
            >
              Погода
            </div>
            <div className="w-8"></div>
          </div>

          <div className="flex-1 px-6 py-4 overflow-y-auto pb-32">
            <div className="space-y-4">
              <div className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-4 shadow-md">
                <div className="h-12 animate-pulse bg-stone-200 rounded-lg" />
                <div className="mt-3 h-10 animate-pulse bg-stone-200 rounded-xl" />
              </div>
              <div className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-4 shadow-md">
                <div className="h-8 animate-pulse bg-stone-200 rounded-lg w-2/3" />
                <div className="mt-2 h-6 animate-pulse bg-stone-200 rounded-lg w-1/2" />
              </div>
            </div>
          </div>

          <div className="py-4 px-6 flex justify-around items-center bg-white/60 backdrop-blur-sm border border-white/20 rounded-full mx-4 shadow-sm">
            <button onClick={() => navigate('/weather')} className="flex flex-col items-center gap-0.5">
              <img src="/icons/weather.png" alt="Погода" className="w-8 h-8" />
              <span className="text-[10px] text-gray-700">Погода</span>
            </button>
            <div className="w-px h-8 bg-gray-300"></div>
            <button onClick={() => navigate('/map')} className="flex flex-col items-center gap-0.5">
              <img src="/icons/map.png" alt="Карта" className="w-8 h-8" />
              <span className="text-[10px] text-gray-700">Карта</span>
            </button>
            <div className="w-px h-8 bg-gray-300"></div>
            <button onClick={() => navigate('/chat')} className="flex flex-col items-center gap-0.5">
              <img src="/icons/chat.png" alt="Чат" className="w-8 h-8" />
              <span className="text-[10px] text-gray-700">Чат</span>
            </button>
            <div className="w-px h-8 bg-gray-300"></div>
            <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-0.5">
              <img src="/icons/profile.png" alt="Профиль" className="w-8 h-8" />
              <span className="text-[10px] text-gray-700">Профиль</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/images/trips.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="px-6 pt-6 pb-2 flex justify-between items-center">
          <button
            onClick={handleClose}
            className="font-bold text-center rounded-xl"
            style={{
              fontSize: "28px",
              color: "black",
              backgroundColor: "transparent",
              border: "3px solid black",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ←
          </button>
          <div
            className="font-bold text-center px-10 py-1 rounded-xl"
            style={{
              fontSize: "22px",
              lineHeight: "28px",
              color: "black",
              backgroundColor: "transparent",
              border: "3px solid black",
              display: "inline-block",
              height: "48px",
            }}
          >
            Погода
          </div>
          <div className="w-8"></div>
        </div>

        <div className="flex-1 px-6 py-4 overflow-y-auto pb-32">
          <div className="space-y-4">
            {/* Карточка поиска */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-4 shadow-md">
              <div className="flex gap-3">
                <input
                  value={cityInput}
                  onChange={(e) => handleCityInputChange(e.target.value)}
                  disabled={isFetching}
                  className="flex-1 rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 disabled:opacity-50 focus:ring-2 focus:ring-black/50"
                  placeholder="Введите город"
                />
                <button
                  onClick={handleSearch}
                  disabled={isFetching}
                  className="rounded-2xl bg-black/80 px-4 py-3 font-semibold text-white disabled:opacity-50 hover:bg-black/90 transition"
                >
                  {isFetching ? '...' : 'Показать'}
                </button>
              </div>
              {inputError && <div className="mt-2 text-sm text-rose-600">{inputError}</div>}
            </div>

            {/* Текущая погода */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-6 shadow-md">
              {weather ? (
                <>
                  <div className="text-sm text-stone-600 mb-2">{weather.city}</div>
                  <div className="flex items-center gap-4">
                    <div className="text-6xl">{weather.current.emoji}</div>
                    <div>
                      <div className="text-5xl font-semibold text-stone-900">{weather.current.temp}°C</div>
                      <div className="text-lg text-stone-600">{weather.current.description}</div>
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
              <div className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-4 shadow-md">
                <div className="text-sm font-semibold text-stone-700 mb-3">Прогноз на 3 дня</div>
                <div className="grid grid-cols-3 gap-3">
                  {weather.forecast.map((day, index) => (
                    <div key={index} className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-sm font-medium text-stone-600 mb-2">{day.dayName}</div>
                      <div className="text-3xl mb-2">{day.emoji}</div>
                      <div className="text-sm text-stone-700">
                        <span className="font-semibold">{day.tempMax}°</span>
                        <span className="text-stone-400 mx-1">/</span>
                        <span className="text-stone-500">{day.tempMin}°</span>
                      </div>
                      <div className="text-xs text-stone-500 mt-1">{day.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Нижняя навигация */}
        <div className="py-4 px-6 flex justify-around items-center bg-white/60 backdrop-blur-sm border border-white/20 rounded-full mx-4 shadow-sm">
          <button onClick={() => navigate('/weather')} className="flex flex-col items-center gap-0.5">
            <img src="/icons/weather.png" alt="Погода" className="w-8 h-8" />
            <span className="text-[10px] text-gray-700">Погода</span>
          </button>
          <div className="w-px h-8 bg-gray-300"></div>
          <button onClick={() => navigate('/map')} className="flex flex-col items-center gap-0.5">
            <img src="/icons/map.png" alt="Карта" className="w-8 h-8" />
            <span className="text-[10px] text-gray-700">Карта</span>
          </button>
          <div className="w-px h-8 bg-gray-300"></div>
          <button onClick={() => navigate('/chat')} className="flex flex-col items-center gap-0.5">
            <img src="/icons/chat.png" alt="Чат" className="w-8 h-8" />
            <span className="text-[10px] text-gray-700">Чат</span>
          </button>
          <div className="w-px h-8 bg-gray-300"></div>
          <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-0.5">
            <img src="/icons/profile.png" alt="Профиль" className="w-8 h-8" />
            <span className="text-[10px] text-gray-700">Профиль</span>
          </button>
        </div>
      </div>
    </div>
  );
};