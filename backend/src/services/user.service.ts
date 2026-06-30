import bcrypt from 'bcrypt';
import { prisma } from '../prisma';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

export const updateProfile = async (
  userId: number,
  data: {
    name?: string;
    avatarUrl?: string | null;
  }
) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(typeof data.name === 'string' ? { name: data.name.trim() } : {}),
      ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl || null } : {}),
    },
  });
};

export const changePassword = async (
  userId: number,
  oldPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('Пользователь не найден');
  }

  const isValid = await bcrypt.compare(oldPassword, user.password);
  if (!isValid) {
    throw new Error('Старый пароль указан неверно');
  }

  if (!PASSWORD_REGEX.test(newPassword)) {
    throw new Error('Новый пароль должен содержать минимум 6 символов, цифру, строчную и заглавную буквы');
  }

  const password = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password },
  });

  return true;
};