import { prisma } from "../prisma";
import { assertTripAccess, assertTripOwnerAccess, tripAccessWhere } from "./trip-access.service";

export const getTripsByUser = async (userId: number, status?: string) => {
  return prisma.trip.findMany({
    where: { ...tripAccessWhere(userId), ...(status ? { status } : {}) },
    include: {
      user: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
    orderBy: { startDate: "asc" },
  });
};

export const getTripById = async (tripId: number, userId: number) => {
  await assertTripAccess(tripId, userId);
  return prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      user: { select: { id: true, email: true, name: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      event: { orderBy: { startDateTime: "asc" } },
    },
  });
};

export const createTrip = async (
  userId: number,
  data: { 
    title: string; 
    startDate: Date; 
    endDate?: Date; 
    transfer?: { type: string; startDateTime: string; endDateTime?: string };
  }
) => {
  console.log('🔨 Создание поездки для userId:', userId);
  return prisma.$transaction(async (tx) => {
    const finalEndDate = data.endDate || data.startDate;
    
    const trip = await tx.trip.create({
      data: {
        title: data.title,
        startDate: data.startDate,
        endDate: finalEndDate,
        userId,
        status: "active",
      },
    });
    console.log('✅ Поездка создана, ID:', trip.id);

    await tx.tripMember.create({
      data: { tripId: trip.id, userId, role: "OWNER" },
    });
    console.log('✅ TripMember создан');

    if (data.transfer) {
      const user = await tx.user.findUnique({ where: { id: userId } });
      const userName = user?.name || 'Пользователь';
      
      const typeIcons: Record<string, string> = { flight: '✈️', train: '🚆', car: '' };
      const icon = typeIcons[data.transfer.type] || '🚗';
      
      await tx.event.create({
        data: {
          tripId: trip.id,
          type: data.transfer.type,
          title: `${icon} Трансфер: ${userName}`,
          startDateTime: new Date(data.transfer.startDateTime),
          endDateTime: data.transfer.endDateTime ? new Date(data.transfer.endDateTime) : undefined,
          userId: userId,
        },
      });
      console.log('✅ Трансфер создан');
    }

    return trip;
  });
};

export const updateTrip = async (
  tripId: number,
  userId: number,
  data: Partial<{ title: string; status: string; startDate: Date; endDate: Date }>
) => {
  await assertTripOwnerAccess(tripId, userId);
  return prisma.trip.update({ where: { id: tripId }, data });
};

export const deleteTrip = async (tripId: number, userId: number) => {
  await assertTripOwnerAccess(tripId, userId);
  await prisma.event.deleteMany({ where: { tripId } });
  await prisma.message.deleteMany({ where: { tripId } });
  await prisma.document.deleteMany({ where: { tripId } });
  await prisma.tripMember.deleteMany({ where: { tripId } });
  await prisma.trip.delete({ where: { id: tripId } });
  return true;
};

export const removeMemberFromTrip = async (tripId: number, memberUserId: number, currentUserId: number) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { userId: true },
  });
  if (!trip) throw new Error('Поездка не найдена');
  if (trip.userId !== currentUserId) throw new Error('Только владелец может удалять участников');
  if (memberUserId === currentUserId) throw new Error('Нельзя удалить себя');

  const member = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId: memberUserId } },
  });
  if (!member) throw new Error('Участник не найден');

  await prisma.tripMember.delete({
    where: { tripId_userId: { tripId, userId: memberUserId } },
  });

  return { success: true };
};