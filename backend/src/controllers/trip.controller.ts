import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
    getTripsByUser, // получаем список поездок пользователя
    getTripById,   // получаем одну поездку по id
    createTrip,    // создаем новую поездку
    updateTrip,    // обновляем поездку
    deleteTrip,    // удаляем поездку
} from "../services/trip.service"

const TRIP_STATUSES = ["active", "completed", "cancelled"] as const;

const parseTripDate = (value: unknown) => {
    if (typeof value !== "string" || !value.trim()) {
        return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
};

const isBlankTitle = (value: unknown) => typeof value !== "string" || !value.trim();

const hasInvalidTripRange = (startDate: Date, endDate: Date) => startDate > endDate;

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

        // Возвращаем отдельные блоки trip/members/events по контракту README
        const { user, event, ...tripData } = trip;

        res.json({
            trip: tripData,
            members: user ? [{ ...user, role: "owner" }] : [],
            events: event,
        });
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
        if (isBlankTitle(title) || !startDate || !endDate) {
            return res.status(400).json({ message: "Название, дата начала и окончания обязательны"});
        }

        const parsedStartDate = parseTripDate(startDate);
        const parsedEndDate = parseTripDate(endDate);
        if (!parsedStartDate || !parsedEndDate) {
            return res.status(400).json({ message: "Некорректная дата поездки" });
        }
        if (hasInvalidTripRange(parsedStartDate, parsedEndDate)) {
            return res.status(400).json({ message: "Дата начала не может быть позже даты окончания" });
        }

        const trip = await createTrip(userId, {
            title: title.trim(),
            startDate: parsedStartDate,
            endDate: parsedEndDate,
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

        const existingTrip = await getTripById(tripId, userId);
        if (!existingTrip) {
            return res.status(404).json({message: "Поездка не найдена или нет прав"});
        }

        const { title, status, startDate, endDate } = req.body;
        if (title !== undefined && isBlankTitle(title)) {
            return res.status(400).json({ message: "Название поездки не может быть пустым" });
        }
        if (status !== undefined && !TRIP_STATUSES.includes(status)) {
            return res.status(400).json({ message: "Недопустимый статус поездки" });
        }

        const parsedStartDate = startDate === undefined ? existingTrip.startDate : parseTripDate(startDate);
        const parsedEndDate = endDate === undefined ? existingTrip.endDate : parseTripDate(endDate);
        if (!parsedStartDate || !parsedEndDate) {
            return res.status(400).json({ message: "Некорректная дата поездки" });
        }
        if (hasInvalidTripRange(parsedStartDate, parsedEndDate)) {
            return res.status(400).json({ message: "Дата начала не может быть позже даты окончания" });
        }

        const updated = await updateTrip(tripId, userId, {
            title: typeof title === "string" ? title.trim() : undefined,
            status,
            startDate: startDate === undefined ? undefined : parsedStartDate,
            endDate: endDate === undefined ? undefined : parsedEndDate,
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
