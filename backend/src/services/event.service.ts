import { PrismaClient } from '@prisma/client';
import { chatService } from './chat.service';
import { assertTripAccess, assertTripOwnerAccess, tripAccessWhere } from './trip-access.service';

const prisma = new PrismaClient();

// Создание события
export const createEvent = async (
  tripId: number,
  userId: number,
  data: { type: string; title: string; startDateTime: Date; locationCoords?: string }
) => {
  await assertTripAccess(tripId, userId);

  const newEvent = await prisma.event.create({
    data: { ...data, tripId, userId },
  });

  await chatService.sendMessage(
    tripId,
    userId,
    `📌 Создано событие: ${data.title} (${new Date(data.startDateTime).toLocaleString()})`
  );

  return newEvent;
};

// Получение событий поездки
export const getEventsByTrip = async (tripId: number, userId: number) => {
  await assertTripAccess(tripId, userId);
  return prisma.event.findMany({
    where: { tripId },
    orderBy: { startDateTime: 'asc' },
  });
};

// Обновление события
export const updateEvent = async (
  eventId: number,
  userId: number,
  data: Partial<{ type: string; title: string; startDateTime: Date; locationCoords: string }>
) => {
  // Проверяем доступ к поездке
  const event = await prisma.event.findFirst({
    where: { id: eventId, trip: { ...tripAccessWhere(userId) } },
  });
  if (!event) throw new Error('Событие не найдено или доступ запрещён');

  // Проверяем права: владелец поездки или создатель события
  const trip = await prisma.trip.findUnique({ where: { id: event.tripId } });
  if (!trip) throw new Error('Поездка не найдена');

  const isOwner = trip.userId === userId;
  const isCreator = event.userId === userId;

  if (!isOwner && !isCreator) {
    throw new Error('Нет прав на редактирование этого события');
  }

  return prisma.event.update({
    where: { id: eventId },
    data,
  });
};

// Удаление события
export const deleteEvent = async (eventId: number, userId: number) => {
  const event = await prisma.event.findFirst({
    where: { id: eventId, trip: { ...tripAccessWhere(userId) } },
  });
  if (!event) throw new Error('Событие не найдено или доступ запрещён');

  const trip = await prisma.trip.findUnique({ where: { id: event.tripId } });
  if (!trip) throw new Error('Поездка не найдена');

  const isOwner = trip.userId === userId;
  const isCreator = event.userId === userId;

  if (!isOwner && !isCreator) {
    throw new Error('Нет прав на удаление этого события');
  }

  await prisma.event.delete({ where: { id: eventId } });
  return true;
};