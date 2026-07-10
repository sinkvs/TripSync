import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
    getTripsByUser,
    getTripById,
    createTrip,
    updateTrip,
    deleteTrip,
    removeMemberFromTrip,
} from "../services/trip.service"

export const getUserTrips = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const { status } = req.query;
        const trips = await getTripsByUser(userId, status as string | undefined);
        res.json({ trips });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Ошибка сервера"});
    }
};

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

export const createTripHandler = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const { title, startDate, endDate, transfer } = req.body;
        
        if (!title || !startDate) {
            return res.status(400).json({ message: "Название и дата начала обязательны"});
        }
        
        const trip = await createTrip(userId, {
            title,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : undefined,
            transfer,
        });
        res.status(201).json({ trip });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Ошибка сервера"});
    }
};

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

export const removeMemberHandler = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.userId!;
    const tripId = parseInt(req.params.tripId as string, 10);
    const memberUserId = parseInt(req.params.userId as string, 10);
    
    if (isNaN(tripId) || isNaN(memberUserId)) {
      return res.status(400).json({ message: 'Неверный id' });
    }
    
    await removeMemberFromTrip(tripId, memberUserId, currentUserId);
    res.json({ message: 'Участник удалён' });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message || 'Ошибка удаления участника' });
  }
};