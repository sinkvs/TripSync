import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { chatService } from '../services/chat.service';

export const getChatList = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const chats = await chatService.getChatList(userId);
    res.json({ chats });
  } catch (error) {
    console.error('Ошибка получения списка чатов:', error);
    res.status(500).json({ message: 'Ошибка сервера при загрузке чатов' });
  }
};