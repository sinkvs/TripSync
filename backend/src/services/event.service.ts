import { prisma } from '../prisma';
import { assertTripAccess } from './trip-access.service';

const validateEventDateRange = (startDateTime: Date, endDateTime?: Date | null) => {
    if (endDateTime && endDateTime <= startDateTime) {
        throw new Error('endDateTime должен быть позже startDateTime');
    }
};

// Создаем новое событие в поездке
export const createEvent = async (
    tripId: number,
    userId: number,
    data: {
        type: string;
        title: string;
        startDateTime: Date;
        endDateTime?: Date | null;
        locationCoords?: string;
    }
) => {
    await assertTripAccess(tripId, userId);
    validateEventDateRange(data.startDateTime, data.endDateTime);
    return prisma.event.create({
        data: { ...data, tripId },
    });
};

// Получаем все события поездки
export const getEventsByTrip = async (tripId: number, userId: number) => {
    await assertTripAccess(tripId, userId);
    return prisma.event.findMany({
        where: { tripId },
        orderBy: { startDateTime: 'asc' },
    });
};

// Обновляем событие
export const updateEvent = async (
    eventId: number,
    userId: number,
    data: Partial<{
        type: string;
        title: string;
        startDateTime: Date;
        endDateTime: Date | null;
        locationCoords: string;
    }>
) => {
    const event = await prisma.event.findUnique({
        where: { id: eventId },
    });
    if (!event) throw new Error('Событие не найдено или доступ запрещен');
    await assertTripAccess(event.tripId, userId);

    const nextStartDateTime = data.startDateTime ?? event.startDateTime;
    const nextEndDateTime = data.endDateTime === undefined ? event.endDateTime : data.endDateTime;

    validateEventDateRange(nextStartDateTime, nextEndDateTime);

    return prisma.event.update({
        where: { id: eventId },
        data,
    });
};

// Удаляем событие
export const deleteEvent = async (eventId: number, userId: number) => {
    const event = await prisma.event.findUnique({
        where: { id: eventId },
    });
    if (!event) throw new Error('Событие не найдено или доступ запрещен');
    await assertTripAccess(event.tripId, userId);
    await prisma.event.delete({ where: { id: eventId } });
    return true;
};