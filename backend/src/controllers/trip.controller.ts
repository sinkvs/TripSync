import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
    getTripsByUser, // получаем список поездок пользователя
    getTripById,   // получаем одну поездку по id
    createTrip,    // создаем новую поездку
    updateTrip,    // обновляем поездку
    deleteTrip,    // удаляем поездку
} from "../services/trip.service"

// Возвращаем список поездок для текущего пользователя (GET /api/trips?status=active)
export const getUserTrips = async (req: AuthRequest, res: Response) => {
    try {
        // userId добавляется authMiddleware после проверки JWT
        const userId = req.userId!;
        const { status } = req.query; // например ?status=active
        const trips = await getTripsByUser(userId, status as string | undefined);
        res.json({ trips });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Ошибка сервера"});
    }
};

// Возвращаем детали одной поездки, если она принадлежит пользователю (GET /api/trips/:id)
export const getTripByIdHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const idParam = req.params.id;
        if (!idParam) {
            return res.status(400).json({ message: "Не указан id поездки"});
        }

        const tripId = parseInt(idParam as string, 10);
        if (isNaN(tripId)) {
            return res.status(400).json({ message: "Неверный id" });
        }

        const trip = await getTripById(tripId, userId);
        if (!trip) {
            return res.status(404).json({ message: "Поездка не найдена или нет доступа" });
        }

        res.json({ trip, events: trip.event });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

// Создаем новую поездку (POST /api/trips)
export const createTripHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const { title, startDate, endDate } = req.body;
        if (!title || !startDate || !endDate) {
            return res.status(400).json({ message: "Название, дата начала и окончания обязательны"});
        }
        const trip = await createTrip(userId, {
            title,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
        });
        res.status(201).json({ trip });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Ошибка сервера"});
    }
};

// Обновляем существующую поездку. Можно изменить title, status, start/endDate. (PUT /api/trips/:id)
// Передать можно только те поля, которые нужно изменить (т.е. частичное обновление)
export const updateTripHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const idParam = req.params.id;
        if(!idParam) {
            return res.status(400).json({ message: "Не указан id поездки" });
        }
        const tripId = parseInt(idParam as string, 10);
        if (isNaN(tripId)) {
            return res.status(400).json({ message: "Неверный id" });
        }
        const { title, status, startDate, endDate } = req.body;
        const updated = await updateTrip(tripId, userId, {
            title,
            status,
            startDate: startDate ? new Date (startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });
        if(!updated) {
            return res.status(404).json({message: "Поездка не найдена или нет прав"});
        }
        res.json({ trip: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

// Удаляем поездку (доступно только владельцу). DELETE /api/trips/:id
export const deleteTripHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const idParam = req.params.id;
        if (!idParam) {
            return res.status(400).json({ message: "Не указан id поездки"});
        }
        const tripId = parseInt(idParam as string, 10)
        if (isNaN(tripId)) {
            return res.status(400).json({ message: "Неверный id"})
        }
        const deleted = await deleteTrip(tripId, userId);
        if (!deleted) {
            return res.status(404).json({ message: "Поездка не найдена или нет прав"});
        }
        res.json({ message: "Поездка удалена" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};