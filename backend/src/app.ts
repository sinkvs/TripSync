import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import tripsRoutes from './routes/trips.routes';
import documentsRoutes from './routes/documents.routes';
//import chatRoutes from './routes/chat.routes';
import userRoutes from './routes/user.routes';
//import adminRoutes from './routes/admin.routes';
//import weatherRoutes from './routes/weather.routes';
import { createServer } from 'http';
//import { setupWebSocket } from './websocket/ws.server';

dotenv.config();

const app = express();
const server = createServer(app);
//setupWebSocket(server);

app.use(cors());
app.use(express.json());

// Лог запросов (полезно для отладки)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Подключаем маршруты
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api', documentsRoutes); // документы - подключаются по префиксу /api
app.use('/api', userRoutes);

// Пока отключено
//app.use('/api/chats', chatRoutes);
//app.use('/api', adminRoutes);
//app.use('/api', weatherRoutes);

export { server };