import crypto from 'crypto';

// Генерируем токен для подтверждения email
export const generateVerificationToken = (expiresInHours = 24) => {
  // Случайная строка (токен)
  const rawToken = crypto.randomBytes(32).toString('hex');
  // Хэш токена (будем хранить в БД)
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  // Срок действия (сейчас + часы)
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  return { rawToken, tokenHash, expiresAt };
};

// Проверяем, правильный ли токен
export const isVerificationTokenValid = (rawToken: string, storedHash: string): boolean => {
  const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
  return hash === storedHash;
};