import crypto from 'crypto';
import { prisma } from '../prisma';

export const createInvitation = async (tripId: number, userId: number) => {
  const token = crypto.randomBytes(32).toString('hex');
  const invitation = await prisma.invitation.create({
    data: { token, tripId },
  });
  return invitation;
};

export const acceptInvitation = async (token: string, userId: number) => {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
  });
  if (!invitation) {
    throw new Error('Приглашение не найдено или истекло');
  }

  // Проверяем, есть ли уже участник
  const existing = await prisma.tripMember.findFirst({
    where: {
      tripId: invitation.tripId,
      userId: userId,
    },
  });

  if (!existing) {
    await prisma.tripMember.create({
      data: {
        tripId: invitation.tripId,
        userId,
        role: 'MEMBER',
      },
    });
  }

  // Удаляем приглашение, если оно ещё существует
  await prisma.invitation.deleteMany({
    where: { id: invitation.id },
  });

  return invitation.tripId;
};