import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

// Расширяем стандартный Request, добавляем userId
export interface AuthRequest extends Request {
  userId?: number;
}

// Middleware: читает Bearer токен, верифицирует, кладет userId в req
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Токен не предоставлен" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    
    if (!decoded || typeof decoded.userId !== "number") {
      return res.status(401).json({ message: "Неверный или просроченный токен" });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Неверный или просроченный токен" });
  }
};
