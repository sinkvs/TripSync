import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { chatService } from '../services/chat.service';
import { broadcastToRoom } from '../websocket/ws.server';
/**
 * GET /api/trips/:tripId/messages?limit=50
 * Получить все сообщения поездки (с сортировкой по времени)
 */
export const getMessages = async (req: AuthRequest, res: Response) => {
    try {
        const tripId = parseInt(req.params.tripId as string, 10);
        if (isNaN(tripId)) {
            return res.status(400).json({ message: 'Неверный ID поездки' });
        }
        const limit = parseInt(req.query.limit as string, 10) || 50;
        const skip = parseInt(req.query.skip as string, 10) || 0;
        const userId = req.userId!;
        const messages = await chatService.getMessages(tripId, userId, limit, skip);
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
        const tripId = parseInt(req.params.tripId as string, 10);
        if (isNaN(tripId)) {
            return res.status(400).json({ message: 'Неверный ID поездки' });
        }
        const { content } = req.body;
        const userId = req.userId!;

        if (!content || content.trim() === '') {
            return res.status(400).json({ message: 'Текст сообщения не может быть пустым' });
        }
        const newMessage = await chatService.sendMessage(tripId, userId, content.trim());
        res.status(201).json({ message: newMessage });

        broadcastToRoom(String(tripId), {
            type: 'new_message',
            message: newMessage,
        });
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

        await chatService.deleteMessage(messageId, req.userId!);
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

        const userId = req.userId!;
        const messages = await chatService.searchMessages(tripId, userId, query);

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