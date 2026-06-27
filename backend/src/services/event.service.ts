import { PrismaClient } from '@prisma/client';
import { chatService } from './chat.service';

const prisma = new PrismaClient();

// Проверяем, принадлежит ли поездка пользователю. Используем для защиты всех операций с событиями
const checkTripOwnership = async (tripId: number, userId: number) => {
    const trip = await prisma.trip.findFirst({
        where: { id: tripId, userId },
    });
    if (!trip) throw new Error('Поездка не найдена или доступ запрещен');
    return trip;
}

// Создаем новое событие в поездке
export const createEvent = async (
    tripId: number,
    userId: number,
    data: { type: string; title: string; startDateTime: Date; locationCoords?: string }
) => {
    await checkTripOwnership(tripId, userId);
    
    // Создаем событие
    const newEvent = await prisma.event.create({
        data: { ...data, tripId },
    });

    // Отправляем системное сообщение в чат
    await chatService.sendMessage(
        tripId,
        userId,
        `📌 Создано событие: ${data.title} (${new Date(data.startDateTime).toLocaleString()})`
    );

    return newEvent;
};

// Получаем все события поездки
export const getEventsByTrip = async (tripId: number, userId: number) => {
    await checkTripOwnership(tripId, userId);
    return prisma.event.findMany({
        where: { tripId },
        orderBy: { startDateTime: 'asc' },
    });
};

// Обновляем событие
export const updateEvent = async (
    eventId: number,
    userId: number,
    data: Partial<{ type: string; title: string; startDateTime: Date; locationCoords: string }>
) => {
    const event = await prisma.event.findFirst({
        where: { id: eventId, trip: { userId } },
    });
    if (!event) throw new Error('Событие не найдено или доступ запрещен');
    return prisma.event.update({
        where: { id: eventId },
        data,
    });
};

// Удаляем событие
export const deleteEvent = async (eventId: number, userId: number) => {
    const event = await prisma.event.findFirst({
        where: { id: eventId, trip: { userId } },
    });
    if (!event) throw new Error('Событие не найдено или доступ запрещен');
    await prisma.event.delete({ where: { id: eventId } });
    return true;
};