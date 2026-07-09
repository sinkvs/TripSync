import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import {
  blockUser,
  deleteTripByAdmin,
  getUsers,
  unblockUser,
} from '../controllers/admin.controller';

// Роутер админских функций
const router = Router();

// Проверка авторизации и роли админа
router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

// Получение списка пользователей
router.get('/users', getUsers);
// Блокировка пользователя
router.post('/users/:id/block', blockUser);
// Разблокировка пользователя
router.post('/users/:id/unblock', unblockUser);
// Удаление поездки
router.delete('/trips/:id', deleteTripByAdmin);

export default router;