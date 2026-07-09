import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getChatList } from '../controllers/chat.controller';
import { getMessages, sendMessage, deleteMessage, searchMessages, togglePin } from '../controllers/message.controller';

// Роутер чата с поддержкой вложенных параметров
const router = Router({ mergeParams: true });

// Проверка авторизации для всех маршрутов чата
router.use(authMiddleware);

// Список чатов пользователя
router.get('/', getChatList);
// Получение сообщений поездки
router.get('/:tripId/messages', getMessages);
// Поиск по сообщениям поездки
router.get('/:tripId/messages/search', searchMessages);
// Отправка нового сообщения
router.post('/:tripId/messages', sendMessage);
// Удаление сообщения
router.delete('/messages/:messageId', deleteMessage);
// Закрепление сообщения
router.patch('/messages/:messageId/pin', togglePin);

export default router;