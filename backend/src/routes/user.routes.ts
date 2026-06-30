import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { changePasswordHandler, updateProfileHandler } from '../controllers/user.controller';

const router = Router();

router.use(authMiddleware);
router.put('/user/profile', updateProfileHandler);
router.put('/user/password', changePasswordHandler);

export default router;