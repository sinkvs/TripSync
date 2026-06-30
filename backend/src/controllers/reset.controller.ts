import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '../prisma';

// Запрос ссылки для сброса пароля
export const requestReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email обязателен' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Для безопасности не говорим, что пользователь не найден
      return res.json({ message: 'Если такой email зарегистрирован, ссылка для сброса будет отправлена' });
    }

    // Генерируем токен
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 час

    // Сохраняем хеш токена и срок действия
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash: hash,
        resetExpiresAt: expiresAt,
      },
    });

    // Формируем ссылку для фронтенда
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    // В учебном проекте возвращаем ссылку прямо в ответе (показываем пользователю)
    res.json({
      message: 'Ссылка для сброса пароля создана',
      resetLink,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера при запросе сброса пароля' });
  }
};

// Сброс пароля
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Токен и новый пароль обязательны' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Пароль должен быть не менее 6 символов' });
    }

    const hash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetTokenHash: hash,
        resetExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Неверный или просроченный токен' });
    }

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetTokenHash: null,
        resetExpiresAt: null,
      },
    });

    res.json({ message: 'Пароль успешно изменён' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера при сбросе пароля' });
  }
};