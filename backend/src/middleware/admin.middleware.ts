import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

// Проверка: только пользователь с id = 1 считается админом
export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userId !== 1) {
    return res.status(403).json({ message: "Доступ запрещен. Требуется роль администратора." });
  }
  next();
};
