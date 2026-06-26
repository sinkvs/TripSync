import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { chatService } from '../services/chat.service';

/**
 * GET /api/trips/:tripId/messages?limit=50
 * Получить все сообщения поездки (с сортировкой по времени)
 */
export const getMessages = async (req: AuthRequest, res: Response) => {
    try {
        // 1. Извлекаем tripId из параметров маршрута и преобразуем в число
        const tripId = parseInt(req.params.tripId as string, 10);
        if (isNaN(tripId)) {
            return res.status(400).json({ message: 'Неверный ID поездки' });
        }
        // 2. Лимит сообщений
        const limit = parseInt(req.query.limit as string, 10) || 50;
        const skip = parseInt(req.query.skip as string, 10) || 0;
        // 3. ID текущего пользователя (добавляется authMiddleware)
        const userId = req.userId!;

        // 4. Проверяем, что поездка принадлежит пользователю (безопасность)
        const trip = await prisma.trip.findFirst({
            where: { id: tripId, userId },
        });
        if (!trip) {
            return res.status(404).json({ message: 'Поездка не найдена или нет доступа' });
        }

        // 5. Загружаем сообщения через сервис с пагинацией
        const messages = await chatService.getMessages(tripId, userId, limit, skip);

        // 6. Отправляем ответ
        res.json({ messages });
    } catch (error) {
        console.error('Ошибка при получении сообщений:', error);
        res.status(500).json({ message: 'Ошибка сервера при загрузке сообщений' });
    }
};

/**
 * POST /api/trips/:tripId/messages
 * Отправить новое сообщение в чат поездки
 */
export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        // 1. Извлекаем данные из запроса
        const tripId = parseInt(req.params.tripId as string, 10);
        if (isNaN(tripId)) {
            return res.status(400).json({ message: 'Неверный ID поездки' });
        }
        const { content } = req.body;
        const userId = req.userId!;

        // 2. Валидация: сообщение не может быть пустым
        if (!content || content.trim() === '') {
            return res.status(400).json({ message: 'Текст сообщения не может быть пустым' });
        }

        // 3. Проверяем, что поездка существует и принадлежит пользователю
        const trip = await prisma.trip.findFirst({
            where: { id: tripId, userId },
        });
        if (!trip) {
            return res.status(404).json({ message: 'Поездка не найдена или нет доступа' });
        }

        // 4. Создаём новое сообщение в БД
        const newMessage = await prisma.message.create({
            data: {
                content: content.trim(),
                tripId,
                senderId: userId,
                messageType: 'text', // можно расширить для системных сообщений
                readBy: [], // пока никто не прочитал
            },
            include: {
                sender: {
                    select: { id: true, name: true },
                },
            },
        });

        // 5. Отправляем созданное сообщение обратно клиенту
        res.status(201).json({ message: newMessage });
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        res.status(500).json({ message: 'Ошибка сервера при отправке сообщения' });
    }
};

/**
 * DELETE /api/messages/:messageId
 * Удалить сообщение по id (только если пользователь – владелец сообщения)
 */
export const deleteMessage = async (req: AuthRequest, res: Response) => {
    try {
        const messageId = parseInt(req.params.messageId as string, 10);
        if (isNaN(messageId)) {
            return res.status(400).json({ message: 'Неверный ID сообщения' });
        }

        const userId = req.userId!;

        // Находим сообщение и проверяем, что оно принадлежит пользователю
        const message = await prisma.message.findFirst({
            where: { id: messageId, senderId: userId },
        });

        if (!message) {
            return res.status(404).json({ message: 'Сообщение не найдено или нет прав' });
        }

        await prisma.message.delete({ where: { id: messageId } });

        res.json({ message: 'Сообщение удалено' });
    } catch (error) {
        console.error('Ошибка при удалении сообщения:', error);
        res.status(500).json({ message: 'Ошибка сервера при удалении сообщения' });
    }
};

/**
 * GET /api/trips/:tripId/messages/search?q=текст
 * Поиск сообщений поездки по тексту
 */
export const searchMessages = async (req: AuthRequest, res: Response) => {
    try {
        const tripId = parseInt(String(req.params.tripId), 10);
        if (isNaN(tripId)) {
            return res.status(400).json({ message: 'Неверный ID поездки' });
        }

        const query = String(req.query.q || '').trim();
        if (!query) {
            return res.status(400).json({ message: 'Не задан поисковый запрос' });
        }

         console.log('🔍 searchMessages вызван, tripId:', tripId, 'query:', query);

        const userId = req.userId!;

        // Проверяем доступ к поездке
        const trip = await prisma.trip.findFirst({
            where: { id: tripId, userId },
        });
        if (!trip) {
            return res.status(404).json({ message: 'Поездка не найдена или нет доступа' });
        }

        const messages = await prisma.message.findMany({
            where: {
                tripId,
                content: {
                    contains: query.trim(),
                    mode: 'insensitive', 
                },
            },
            include: {
                sender: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { createdAt: 'asc' },
        });

        res.json({ messages });
    } catch (error) {
        console.error('Ошибка при поиске сообщений:', error);
        res.status(500).json({ message: 'Ошибка сервера при поиске сообщений' });
    }
};

export const togglePin = async (req: AuthRequest, res: Response) => {
  try {
    const messageId = parseInt(req.params.messageId as string, 10);
    if (isNaN(messageId)) return res.status(400).json({ message: 'Неверный ID' });
    const userId = req.userId!;
    const updated = await chatService.togglePin(messageId, userId);
    res.json({ message: updated });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Ошибка' });
  }
};