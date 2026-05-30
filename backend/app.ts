// Необходимые модули
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Загружаем переменные окружения из .env
dotenv.config();

// Создаем экземпляр приложения Express
const app = express();

// Разрешаем CORS для всех источников
app.use(cors());

// Позволяем серверу принимать JSON в теле запроса
app.use(express.json());

// Простой маршрут для проверки работы сервера
app.get('/', (req, res) => {
  res.send('TripSync API работает');
});

export default app;