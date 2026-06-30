import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import tripsRoutes from './routes/trips.routes';
import chatRoutes from './routes/chat.routes';
//import documentsRoutes from './routes/documents.routes';
//import userRoutes from './routes/user.routes';
//import adminRoutes from './routes/admin.routes';
//import weatherRoutes from './routes/weather.routes';
import { createServer } from 'http';
import { setupWebSocket } from './websocket/ws.server';

dotenv.config();

const app = express();
const server = createServer(app);
setupWebSocket(server); // подключаем WebSocket

// Лог запросов для отладки
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Разрешаем кросс-доменные запросы
app.use(cors());
// Парсим JSON в теле запроса
app.use(express.json());

// Проверочный эндпоинт
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Подключаем маршруты регистрации, логина и профиля
app.use('/api/auth', authRoutes);

// Маршрут поездок по префиксу /api/trips
app.use('/api/trips', tripsRoutes);
//app.use('/api', documentsRoutes);
//app.use('/api', userRoutes);
//app.use('/api', adminRoutes);
//app.use('/api', weatherRoutes);

// Список чатов, сообщения
app.use('/api/chats', chatRoutes);  
app.use('/api/trips', chatRoutes);  

export { server };