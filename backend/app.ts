// Необходимые модули
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tripsRoutes from "./routes/trips.routes";

// Загружаем переменные окружения из .env
dotenv.config();

// Создаем экземпляр приложения Express
const app = express();

// Разрешаем CORS для всех источников
app.use(cors());

// Позволяем серверу принимать JSON в теле запроса
app.use(express.json());

// Маршрут поездок по префиксу /api/trips
app.use("/api/trips", tripsRoutes)

// Простой маршрут для проверки работы сервера
app.get('/', (req, res) => {
  res.send('TripSync API работает');
});

export default app;