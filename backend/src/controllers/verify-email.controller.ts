import { Request, Response } from "express";
import { verifyUserEmail } from "../services/auth.service";

// Обработчик GET-запроса на /api/auth/verify-email
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    // Берем токен из строки запроса (query-параметр ?token=...)
    const { token } = req.query;

    // Если токен не передан или это не строка - ошибка
    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Токен не указан" });
    }

    // Вызываем сервис проверки токена и активации аккаунта
    const success = await verifyUserEmail(token);

    // Если токен не подошел (не найден/просрочен/ еверный) - ошибка
    if (!success) {
      return res.status(400).json({ message: "Неверный или просроченный токен" });
    }

    // Редирект на фронт
    // После подтверждения почты пользователь попадает на /login с параметром verified=true
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/login?verified=true`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};