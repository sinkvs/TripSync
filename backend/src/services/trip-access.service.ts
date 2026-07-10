import { prisma } from "../prisma";

// Условие доступа: владелец или участник
export const tripAccessWhere = (userId: number) => ({
  OR: [
    { userId },
    { members: { some: { userId } } },
  ],
});

// Проверка доступа к поездке
export const assertTripAccess = async (tripId: number, userId: number) => {
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      ...tripAccessWhere(userId),
    },
  });
  if (!trip) {
    throw new Error('Поездка не найдена или доступ запрещен');
  }
  return trip;
};

// Проверка прав владельца
export const assertTripOwnerAccess = async (tripId: number, userId: number) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId, userId },
  });
  if (!trip) {
    throw new Error('Доступ запрещён: только владелец поездки');
  }
  return trip;
};