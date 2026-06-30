import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { findUserByEmail, findUserById, createUserWithVerification } from "../services/auth.service";
import { generateToken } from "../utils/jwt";
import { AuthRequest } from "../middleware/auth.middleware";
import { sendVerificationEmail } from "../services/email.service";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

export const register = async (req: Request, res: Response) => {
  try {
    const email = normalizeEmail(req.body.email || '');
    const password = (req.body.password || '').trim();
    const name = (req.body.name || '').trim();

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Все поля обязательны" });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Введите корректный email" });
    }
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message: "Пароль должен быть не короче 6 символов и содержать цифру, строчную и заглавную буквы",
      });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Email уже занят" });
    }

    const { user, rawToken } = await createUserWithVerification(email, password, name);
    const verificationLink = `${backendUrl}/api/auth/verify-email?token=${rawToken}`;

    if (process.env.NODE_ENV === 'production') {
      await sendVerificationEmail(user.email, verificationLink);
      return res.status(201).json({
        message: "На почту отправлено письмо с подтверждением.",
        user: { id: user.id, email: user.email, name: user.name },
      });
    } else {
      return res.status(201).json({
        message: "Регистрация успешна. Подтвердите email по ссылке.",
        verificationLink,
        user: { id: user.id, email: user.email, name: user.name },
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const email = normalizeEmail(req.body.email || '');
    const password = (req.body.password || '').trim();

    if (!email || !password) {
      return res.status(400).json({ message: "Email и пароль обязательны" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Неверные учетные данные" });
    }

    // Временно пропускаем проверку emailVerified для отладки
    // if (!user.emailVerified) {
    //   return res.status(401).json({ message: "Подтвердите email" });
    // }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Неверные учетные данные" });
    }

    const token = generateToken(user.id);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'USER',
        avatarUrl: user.avatarUrl,
        isBlocked: user.isBlocked || false,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'USER',
        avatarUrl: user.avatarUrl,
        isBlocked: user.isBlocked || false,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};