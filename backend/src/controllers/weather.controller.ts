import { Request, Response } from 'express';
import {
  getWeatherByCityName,
  getWeatherByCoords,
  GeocodeNotFoundError,
  WeatherFetchError,
  DEFAULT_CITY,
} from '../services/weather.service';

export const getWeatherHandler = async (req: Request, res: Response) => {
  const { city, lat, lon } = req.query;

  try {
    // Ветка для бонуса из п.5: фронт уже определил координаты через geolocation API,
    // геокодинг по имени тогда не нужен.
    if (typeof lat === 'string' && typeof lon === 'string' && lat.trim() && lon.trim()) {
      const parsedLat = Number(lat);
      const parsedLon = Number(lon);

      if (Number.isNaN(parsedLat) || Number.isNaN(parsedLon)) {
        res.status(400).json({ errorType: 'INVALID_COORDS', message: 'Некорректные координаты' });
        return;
      }

      const weather = await getWeatherByCoords(parsedLat, parsedLon, DEFAULT_CITY);
      res.json(weather);
      return;
    }

    const cityQuery = typeof city === 'string' && city.trim() ? city : DEFAULT_CITY;
    const weather = await getWeatherByCityName(cityQuery);
    res.json(weather);
  } catch (error) {
    if (error instanceof GeocodeNotFoundError) {
      // п.2.2 / п.2.5.2 — город не найден геокодингом
      res.status(404).json({
        errorType: 'GEOCODE_NOT_FOUND',
        city: error.cityQuery,
        message: error.message,
      });
      return;
    }

    if (error instanceof WeatherFetchError) {
      // п.2.3 / п.2.5.4 — координаты есть, но погода не пришла
      res.status(502).json({
        errorType: 'WEATHER_FETCH_FAILED',
        city: error.cityName,
        message: error.message,
      });
      return;
    }

    console.error(error);
    res.status(500).json({ errorType: 'UNKNOWN', message: 'Внутренняя ошибка сервера' });
  }
};