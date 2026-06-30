import { prisma } from '../prisma';
import { assertTripAccess, tripAccessWhere } from './trip-access.service';

export const chatService = {
  // Получить список чатов (поездок) пользователя с последним сообщением
  getChatList: async (userId: number) => {
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
    return trips.map((trip) => {
      const lastMessage = trip.messages[0] || null;
      return {
        id: trip.id,
        title: trip.title,
        startDate: trip.startDate,
        endDate: trip.endDate,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              sender: lastMessage.sender,
              readBy: lastMessage.readBy,
            }
          : null,
      };
    });
  },

  // Получить сообщения поездки
  getMessages: async (tripId: number, userId: number, limit: number = 50, skip: number = 0) => {
    await assertTripAccess(tripId, userId);

    const messages = await prisma.message.findMany({
      where: { tripId },
      include: {
        sender: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: skip,
    });
    return messages;
  },

  // Отправить сообщение
  sendMessage: async (tripId: number, userId: number, content: string) => {
    await assertTripAccess(tripId, userId);

    return prisma.message.create({
      data: {
        content: content.trim(),
        tripId,
        senderId: userId,
        type: 'text',
        readBy: [],
      },
      include: {
        sender: { select: { id: true, name: true } },
      },
    });
  },

  // Удалить сообщение
  deleteMessage: async (messageId: number, userId: number) => {
    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) throw new Error('Сообщение не найдено или нет прав');
    await assertTripAccess(message.tripId, userId);
    await prisma.message.delete({ where: { id: messageId } });
    return true;
  },

    // Переключаем закрепление сообщения
  togglePin: async (messageId: number, userId: number) => {
    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) throw new Error('Сообщение не найдено или нет прав');
    await assertTripAccess(message.tripId, userId);
    return prisma.message.update({
      where: { id: messageId },
      data: { isPinned: !message.isPinned },
    });
  },
  // Поиск сообщений
  searchMessages: async (tripId: number, userId: number, query: string) => {
    await assertTripAccess(tripId, userId);

    return prisma.message.findMany({
      where: {
        tripId,
        content: {
          contains: query.trim(),
          mode: 'insensitive',
        },
      },
      include: {
        sender: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  },
};