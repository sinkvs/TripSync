import { prisma } from '../prisma';

export const chatService = {
  // Получить список чатов (поездок) пользователя с последним сообщением
  getChatList: async (userId: number) => {
    const trips = await prisma.trip.findMany({
      where: { userId },
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
    // Проверка доступа
    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) throw new Error('Поездка не найдена или нет доступа');

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
    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) throw new Error('Поездка не найдена или нет доступа');

    return prisma.message.create({
      data: {
        content: content.trim(),
        tripId,
        senderId: userId,
        messageType: 'text',
        readBy: [],
      },
      include: {
        sender: { select: { id: true, name: true } },
      },
    });
  },

  // Удалить сообщение
  deleteMessage: async (messageId: number, userId: number) => {
    const message = await prisma.message.findFirst({
      where: { id: messageId, senderId: userId },
    });
    if (!message) throw new Error('Сообщение не найдено или нет прав');
    await prisma.message.delete({ where: { id: messageId } });
    return true;
  },

    // Переключаем закрепление сообщения
  togglePin: async (messageId: number, userId: number) => {
    const message = await prisma.message.findFirst({
      where: { id: messageId, senderId: userId }, // только автор может закрепить
    });
    if (!message) throw new Error('Сообщение не найдено или нет прав');
    return prisma.message.update({
      where: { id: messageId },
      data: { isPinned: !message.isPinned },
    });
  },
  // Поиск сообщений
  searchMessages: async (tripId: number, userId: number, query: string) => {
    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) throw new Error('Поездка не найдена или нет доступа');

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