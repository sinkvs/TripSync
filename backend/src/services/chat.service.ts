import { prisma } from '../prisma';
import { tripAccessWhere } from './trip-access.service';

export const chatService = {
  getChatList: async (userId: number) => {
    console.log('🔍 getChatList для userId:', userId);

    const trips = await prisma.trip.findMany({
      where: tripAccessWhere(userId),
      orderBy: { startDate: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { id: true, name: true } },
          },
        },
      },
    });

    console.log(`📦 Найдено поездок: ${trips.length}`);
    if (trips.length > 0) {
      console.log('🆔 IDs:', trips.map(t => t.id));
    } else {
      console.log('❌ Поездок не найдено. Проверьте таблицу Trip и TripMember.');
    }

    return trips.map((trip) => ({
      id: trip.id,
      title: trip.title,
      startDate: trip.startDate,
      endDate: trip.endDate,
      lastMessage: trip.messages[0] ? {
        id: trip.messages[0].id,
        content: trip.messages[0].content,
        createdAt: trip.messages[0].createdAt,
        sender: trip.messages[0].sender,
        readBy: trip.messages[0].readBy,
      } : null,
    }));
  },

  getMessages: async (tripId: number, userId: number, limit: number = 50, skip: number = 0) => {
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, ...tripAccessWhere(userId) },
    });
    if (!trip) throw new Error('Доступ запрещен');
    return prisma.message.findMany({
      where: { tripId },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: skip,
    });
  },

  sendMessage: async (tripId: number, userId: number, content: string) => {
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, ...tripAccessWhere(userId) },
    });
    if (!trip) throw new Error('Доступ запрещен');
    return prisma.message.create({
      data: { content: content.trim(), tripId, senderId: userId, type: 'text', readBy: [] },
      include: { sender: { select: { id: true, name: true } } },
    });
  },

  deleteMessage: async (messageId: number, userId: number) => {
    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) throw new Error('Сообщение не найдено');
    const trip = await prisma.trip.findFirst({
      where: { id: message.tripId, ...tripAccessWhere(userId) },
    });
    if (!trip) throw new Error('Доступ запрещен');
    await prisma.message.delete({ where: { id: messageId } });
    return true;
  },

  togglePin: async (messageId: number, userId: number) => {
    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) throw new Error('Сообщение не найдено');
    const trip = await prisma.trip.findFirst({
      where: { id: message.tripId, ...tripAccessWhere(userId) },
    });
    if (!trip) throw new Error('Доступ запрещен');
    return prisma.message.update({
      where: { id: messageId },
      data: { isPinned: !message.isPinned },
    });
  },

  searchMessages: async (tripId: number, userId: number, query: string) => {
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, ...tripAccessWhere(userId) },
    });
    if (!trip) throw new Error('Доступ запрещен');
    return prisma.message.findMany({
      where: {
        tripId,
        content: { contains: query.trim(), mode: 'insensitive' },
      },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });
  },
};