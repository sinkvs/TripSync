import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { findUserByEmail, findUserById, createUserWithVerification } from "../services/auth.service";
import { generateToken } from "../utils/jwt";
import { AuthRequest } from "../middleware/auth.middleware";
import { sendVerificationEmail } from "../services/email.service";

// Регистрация нового пользователя
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Все поля обязательны" });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email уже занят" });
    }

    const { user, rawToken } = await createUserWithVerification(email, password, name);
    const verificationLink = `http://localhost:5000/api/auth/verify-email?token=${rawToken}`;

    if (process.env.NODE_ENV === 'production') {
      await sendVerificationEmail(user.email, verificationLink);
      return res.status(201).json({
        message: "Регистрация успешна. На вашу почту отправлено письмо с подтверждением.",
        user: { id: user.id, email: user.email, name: user.name },
      });
    } else {
      return res.status(201).json({
        message: "Регистрация успешна. Подтвердите email, перейдя по ссылке (dev mode).",
        verificationLink,
        user: { id: user.id, email: user.email, name: user.name },
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Логин (вход) - проверяет email и пароль
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email и пароль обязательны" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Неверные учетные данные" });
    }

    if (!user.emailVerified) {
      return res.status(401).json({ message: "Подтвердите email, перейдя по ссылке из письма" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Неверные учетные данные" });
    }

    const token = generateToken(user.id);
    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Получение профиля (требует валидный JWT)
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    res.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
