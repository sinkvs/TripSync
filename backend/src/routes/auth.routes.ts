import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller";
import { verifyEmail } from "../controllers/verify-email.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Публичные маршруты (не требуют JWT)
router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);

// Защищенный маршрут (требует JWT)
router.get("/me", authMiddleware, getMe);

export default router;
