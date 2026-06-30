import { prisma } from '../prisma';

export const tripAccessWhere = (userId: number) => ({
  OR: [{ userId }, { members: { some: { userId } } }],
});

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

export const assertTripOwnerAccess = async (tripId: number, userId: number) => {
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      userId,
    },
  });

  if (!trip) {
    throw new Error('Поездка не найдена или доступ запрещен');
  }

  return trip;
};