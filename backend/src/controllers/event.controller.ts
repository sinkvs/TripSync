import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { createEvent, getEventsByTrip, updateEvent, deleteEvent } from '../services/event.service';

const ALLOWED_EVENT_TYPES = new Set(['flight', 'hotel', 'event']);
const EVENT_VALIDATION_ERRORS = new Set([
    'type должен быть одним из: flight, hotel, event',
    'title не должен быть пустым',
    'startDateTime должен быть корректной датой',
    'endDateTime должен быть корректной датой',
    'endDateTime должен быть позже startDateTime',
]);

const parseDateTime = (value: unknown): Date | undefined => {
    if (typeof value !== 'string' || !value.trim()) {
        return undefined;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
};

const normalizeEventPayload = (
    body: Record<string, unknown>,
    requireRequiredFields = false
) => {
    const { type, title, startDateTime, endDateTime, locationCoords } = body;

    if (requireRequiredFields && (!type || !title || !startDateTime)) {
        return { error: 'type, title, startDateTime обязательны' };
    }

    if (type !== undefined) {
        if (typeof type !== 'string' || !ALLOWED_EVENT_TYPES.has(type)) {
            return { error: 'type должен быть одним из: flight, hotel, event' };
        }
    }

    if (title !== undefined) {
        if (typeof title !== 'string' || !title.trim()) {
            return { error: 'title не должен быть пустым' };
        }
    }

    let parsedStartDateTime: Date | undefined;
    if (startDateTime !== undefined) {
        parsedStartDateTime = parseDateTime(startDateTime);
        if (!parsedStartDateTime) {
            return { error: 'startDateTime должен быть корректной датой' };
        }
    }

    let parsedEndDateTime: Date | undefined;
    if (endDateTime !== undefined) {
        if (endDateTime === null || endDateTime === '') {
            parsedEndDateTime = undefined;
        } else {
            parsedEndDateTime = parseDateTime(endDateTime);
            if (!parsedEndDateTime) {
                return { error: 'endDateTime должен быть корректной датой' };
            }
        }
    }

    if (parsedStartDateTime && parsedEndDateTime && parsedEndDateTime <= parsedStartDateTime) {
        return { error: 'endDateTime должен быть позже startDateTime' };
    }

    return {
        data: {
            ...(type !== undefined ? { type } : {}),
            ...(title !== undefined ? { title: title.trim() } : {}),
            ...(parsedStartDateTime ? { startDateTime: parsedStartDateTime } : {}),
            ...(parsedEndDateTime !== undefined ? { endDateTime: parsedEndDateTime } : {}),
            ...(typeof locationCoords === 'string' && locationCoords.trim()
                ? { locationCoords: locationCoords.trim() }
                : {}),
        },
    };
};

// Создаем событие (POST /trips/:tripId/events)
export const createEventHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const tripId = parseInt(req.params.tripId as string, 10);
        const normalized = normalizeEventPayload(req.body, true);
        if ('error' in normalized) {
            return res.status(400).json({ message: normalized.error });
        }

        const event = await createEvent(tripId, userId, normalized.data as any);
        res.status(201).json({ event });
    } catch (error: any) {
        console.error(error);
        if (EVENT_VALIDATION_ERRORS.has(error.message)) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message === 'Поездка не найдена или доступ запрещен') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message || 'Ошибка сервера' });
    }
};

// Получаем все события поездки (GET /trips/:tripId/events)
export const getEventsHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const tripId = parseInt(req.params.tripId as string, 10);
        const events = await getEventsByTrip(tripId, userId);
        res.json({ events });
    } catch (error: any) {
        console.error(error);
        if (error.message === 'Поездка не найдена или доступ запрещен') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message || 'Ошибка сервера' });
    }
};

// Обновление события (PUT /trips/:tripId/events/:eventId)
export const updateEventHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const eventId = parseInt(req.params.eventId as string, 10);
        const normalized = normalizeEventPayload(req.body);
        if ('error' in normalized) {
            return res.status(400).json({ message: normalized.error });
        }

        const updated = await updateEvent(eventId, userId, normalized.data as any);
        res.json({ event: updated });
    } catch (error: any) {
        console.error(error);
        if (EVENT_VALIDATION_ERRORS.has(error.message)) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message === 'Событие не найдено или доступ запрещен') {
            return res.status(404).json({ message: 'Событие не найдено или нет прав' });
        }
        res.status(500).json({ message: error.message || 'Ошибка сервера' });
    }
};

// Удаление события (DELETE /trips/:tripId/events/:eventId)
export const deleteEventHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const eventId = parseInt(req.params.eventId as string, 10);
        await deleteEvent(eventId, userId);
        res.json({ message: 'Событие удалено' });
    } catch (error: any) {
        console.error(error);
        if (error.message === 'Событие не найдено или доступ запрещен') {
            res.status(404).json({ message: 'Событие не найдено или нет прав' });
        } else {
            res.status(500).json({ message: error.message || 'Ошибка сервера' });
        }
    }
};