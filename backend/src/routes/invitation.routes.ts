import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { createInvitationHandler, acceptInvitationHandler } from '../controllers/invitation.controller';

const router = Router();

router.post('/trips/:tripId/invite', authMiddleware, createInvitationHandler);
router.post('/invitations/:token', authMiddleware, acceptInvitationHandler);

export default router;