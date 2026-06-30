import { Response, NextFunction } from 'express';
import { findUserById } from '../services/auth.service';
import { AuthRequest } from './auth.middleware';

export const roleMiddleware = (requiredRole: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Требуется авторизация' });
      }

      const user = await findUserById(userId);
      if (!user) {
        return res.status(401).json({ message: 'Пользователь не найден' });
      }

      if (user.role !== requiredRole.toUpperCase()) {
        return res.status(403).json({ message: 'Недостаточно прав' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  };
};