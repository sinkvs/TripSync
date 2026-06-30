import { prisma } from '../prisma';

// Доступ только у владельца (userId == trip.userId)
export const tripAccessWhere = (userId: number) => ({
  userId: userId,
});

export const assertTripAccess = async (tripId: number, userId: number) => {
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      userId: userId,
    },
  });
  if (!trip) {
    throw new Error('Поездка не найдена или доступ запрещен');
  }
  return trip;
};

export const assertTripOwnerAccess = assertTripAccess;