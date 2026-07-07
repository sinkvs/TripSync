import { Router } from 'express';
import { getWeatherHandler } from '../controllers/weather.controller';

const router = Router();

router.get('/weather', getWeatherHandler);

export default router;