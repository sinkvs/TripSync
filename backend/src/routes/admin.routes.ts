import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import {
  blockUser,
  deleteTripByAdmin,
  getUsers,
  unblockUser,
} from '../controllers/admin.controller';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

router.get('/admin/users', getUsers);
router.post('/admin/users/:id/block', blockUser);
router.post('/admin/users/:id/unblock', unblockUser);
router.delete('/admin/trips/:id', deleteTripByAdmin);

export default router;