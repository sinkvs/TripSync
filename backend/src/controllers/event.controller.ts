import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { createEvent, getEventsByTrip } from '../services/event.service';

// Создаем событие (POST /trips/:tripId/events)
export const createEventHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;                                         // id текущего пользователя из jwt
        const tripId = parseInt(req.params.tripId);                         // id поездки из url
        const { type, title, startDateTime, locationCoords } = req.body;    // данные из тела запроса
    
        // Проверяем обязательные поля
        if (!type || !title || !startDateTime) {
            return res.status(400).json({ message: 'type, title, startDate обязательны' });
        }

        const event = await createEvent(tripId, userId, {
            type,
            title,
            startDateTime: new Date(startDateTime),
            locationCoords,
        });
        res.status(201).json({ event });            // 201 - ресурс создан
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Ошибка сервера'});
    }
};

// Получаем все события поездки (GET /trips/:tripId/events)
export const getEventsHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const tripId = parseInt(req.params.tripId);
        const events = await getEventsByTrip(tripId, userId);
        res.json({ events });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Ошибка сервера' });
    }
};