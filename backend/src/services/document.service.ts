import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { DocumentCategory } from '@prisma/client';
import { prisma } from '../prisma';
import { assertTripAccess } from './trip-access.service';

const uploadsDir = path.resolve(__dirname, '../../uploads/documents');

const ensureUploadsDir = async () => {
  await fs.mkdir(uploadsDir, { recursive: true });
};

const getEncryptionKey = () => {
  const value = process.env.ENCRYPTION_KEY;
  if (!value) {
    throw new Error('Не задан ENCRYPTION_KEY');
  }

  if (/^[0-9a-fA-F]{64}$/.test(value)) {
    return Buffer.from(value, 'hex');
  }

  const buffer = Buffer.from(value, 'utf8');
  if (buffer.length !== 32) {
    throw new Error('ENCRYPTION_KEY должен быть 32 байта или 64 hex-символа');
  }

  return buffer;
};

const encryptBuffer = (buffer: Buffer) => {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]);
};

const decryptBuffer = (buffer: Buffer) => {
  const key = getEncryptionKey();
  const iv = buffer.subarray(0, 12);
  const authTag = buffer.subarray(12, 28);
  const encrypted = buffer.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
};

export const uploadDocument = async ({
  userId,
  tripId,
  eventId,
  category,
  file,
}: {
  userId: number;
  tripId: number;
  eventId?: number | null;
  category: DocumentCategory;
  file: Express.Multer.File;
}) => {
  await assertTripAccess(tripId, userId);

  if (eventId) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event || event.tripId !== tripId) {
      throw new Error('Событие не найдено в выбранной поездке');
    }
  }

  await ensureUploadsDir();

  const encryptedFileName = `${crypto.randomUUID()}.bin`;
  const filePath = path.join(uploadsDir, encryptedFileName);
  await fs.writeFile(filePath, encryptBuffer(file.buffer));

  return prisma.document.create({
    data: {
      fileName: file.originalname,
      encryptedFileName,
      filePath,
      category,
      tripId,
      eventId: eventId ?? null,
      uploadedBy: userId,
    },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
};

export const getDocumentsByTrip = async (tripId: number, userId: number) => {
  await assertTripAccess(tripId, userId);

  // Каждый видит только свои документы
  return prisma.document.findMany({
    where: {
      tripId,
      uploadedBy: userId,
    },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getDocumentStream = async (documentId: number, userId: number) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error('Документ не найден');
  }

  // Проверка доступа к поездке и что документ принадлежит пользователю
  await assertTripAccess(document.tripId, userId);
  if (document.uploadedBy !== userId) {
    throw new Error('Нет доступа к этому документу');
  }

  const encrypted = await fs.readFile(document.filePath);
  const buffer = decryptBuffer(encrypted);

  return { document, buffer };
};

export const deleteDocument = async (documentId: number, userId: number) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error('Документ не найден');
  }

  // Проверка доступа к поездке и что документ принадлежит пользователю
  await assertTripAccess(document.tripId, userId);
  if (document.uploadedBy !== userId) {
    throw new Error('Нет доступа к этому документу');
  }

  await prisma.document.delete({ where: { id: documentId } });
  await fs.rm(document.filePath, { force: true });
  return true;
};