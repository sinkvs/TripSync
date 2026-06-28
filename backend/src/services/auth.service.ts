import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { generateVerificationToken, isVerificationTokenValid } from "./verification.service";
import crypto from 'crypto';

// Явно указываем datasourceUrl из .env
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

const normalizeEmail = (email: string) => email.trim().toLowerCase();

// Поиск пользователя по email
export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
};

export const findUserById = async (id: number) => {
  return prisma.user.findUnique({ where: { id } });
};

// Создание пользователя с верификацией (заменяет старую createUser)
export const createUserWithVerification = async (email: string, password: string, name: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const { rawToken, tokenHash, expiresAt } = generateVerificationToken(24);
  const user = await prisma.user.create({
    data: {
      email: normalizeEmail(email),
      password: hashedPassword,
      name: name.trim(),
      emailVerified: false,
      verificationTokenHash: tokenHash,
      verificationExpiresAt: expiresAt,
    },
  });
  return { user, rawToken };
};

// Подтверждение email по токену
export const verifyUserEmail = async (rawToken: string): Promise<boolean> => {
  // Вычисляем хэш переданного токена
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      verificationTokenHash: tokenHash,
      verificationExpiresAt: { gt: new Date() },
    },
  });

  if (!user) return false

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationTokenHash: null,
      verificationExpiresAt: null,
    },
  });
  return true;
};