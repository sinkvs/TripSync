import { prisma } from "../prisma";
import { assertTripAccess, assertTripOwnerAccess, tripAccessWhere } from "./trip-access.service";

export const getTripsByUser = async (userId: number, status?: string) => {
  return prisma.trip.findMany({
    where: {
      ...tripAccessWhere(userId),
      ...(status ? { status } : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { startDate: "asc" },
  });
};

export const getTripById = async (tripId: number, userId: number) => {
  await assertTripAccess(tripId, userId);
  return prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      event: {
        orderBy: { startDateTime: "asc" },
      },
    },
  });
};

export const createTrip = async (
  userId: number,
  data: { title: string; startDate: Date; endDate: Date }
) => {
  return prisma.trip.create({
    data: {
      ...data,
      userId,
      status: "active",
    },
  });
};

export const updateTrip = async (
  tripId: number,
  userId: number,
  data: Partial<{ title: string; status: string; startDate: Date; endDate: Date }>
) => {
  await assertTripOwnerAccess(tripId, userId);
  return prisma.trip.update({
    where: { id: tripId },
    data,
  });
};

export const deleteTrip = async (tripId: number, userId: number) => {
  await assertTripOwnerAccess(tripId, userId);
  // Удаляем связанные данные
  await prisma.event.deleteMany({ where: { tripId } });
  await prisma.message.deleteMany({ where: { tripId } });
  await prisma.document.deleteMany({ where: { tripId } });
  // Теперь удаляем поездку
  await prisma.trip.delete({ where: { id: tripId } });
  return true;
};