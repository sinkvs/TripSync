import { Response } from 'express';
import { prisma } from '../prisma';

export const getUsers = async (_req: any, res: Response) => {
  try {
    const [users, trips] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isBlocked: true,
          avatarUrl: true,
          createdAt: true,
        },
      }),
      prisma.trip.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          startDate: true,
          endDate: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    res.json({ users, trips });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const blockUser = async (req: any, res: Response) => {
  try {
    const id = Number(req.params.id);
    const user = await prisma.user.update({
      where: { id },
      data: { isBlocked: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isBlocked: true,
      },
    });

    res.json({ user, message: 'Пользователь заблокирован' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Не удалось заблокировать пользователя' });
  }
};

export const unblockUser = async (req: any, res: Response) => {
  try {
    const id = Number(req.params.id);
    const user = await prisma.user.update({
      where: { id },
      data: { isBlocked: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isBlocked: true,
      },
    });

    res.json({ user, message: 'Пользователь разблокирован' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Не удалось разблокировать пользователя' });
  }
};

export const deleteTripByAdmin = async (req: any, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.trip.delete({ where: { id } });
    res.json({ message: 'Поездка удалена' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Не удалось удалить поездку' });
  }
};