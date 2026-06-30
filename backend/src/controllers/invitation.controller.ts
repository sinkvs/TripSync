import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { createInvitation, acceptInvitation } from '../services/invitation.service';

export const createInvitationHandler = async (req: AuthRequest, res: Response) => {
  try {
    const tripId = Number(req.params.tripId);
    const userId = req.userId!;
    const invitation = await createInvitation(tripId, userId);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const link = `${frontendUrl}/join?token=${invitation.token}`;
    res.json({ link });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message || 'Ошибка создания приглашения' });
  }
};

export const acceptInvitationHandler = async (req: AuthRequest, res: Response) => {
  try {
    const token = String(req.params.token);
    const userId = req.userId!;
    const tripId = await acceptInvitation(token, userId);
    res.json({ tripId });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message || 'Ошибка принятия приглашения' });
  }
};