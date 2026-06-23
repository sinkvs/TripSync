import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getChatList = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const trips = await prisma.trip.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { name: true } },
          },
        },
      },
    });

    const chats = trips.map((trip) => {
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

    res.json({ chats });
  } catch (error) {
    console.error('Ошибка при получении списка чатов:', error);
    res.status(500).json({ message: 'Ошибка сервера при загрузке чатов' });
  }
};