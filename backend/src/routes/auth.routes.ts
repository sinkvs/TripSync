import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller";
import { verifyEmail } from "../controllers/verify-email.controller";
import { requestReset, resetPassword } from "../controllers/reset.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Публичные маршруты (не требуют JWT)
router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);

// Восстановление пароля
router.post("/request-reset", requestReset);   // запрос ссылки
router.post("/reset-password", resetPassword); // сброс пароля

// Защищенный маршрут (требует JWT)
router.get("/me", authMiddleware, getMe);

export default router;
