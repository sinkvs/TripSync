import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { changePassword, updateProfile } from '../services/user.service';

export const updateProfileHandler = async (req: AuthRequest, res: Response) => {
  try {
    const user = await updateProfile(req.userId!, {
      name: req.body.name,
      avatarUrl: req.body.avatarUrl,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message || 'Не удалось обновить профиль' });
  }
};

export const changePasswordHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Старый и новый пароль обязательны' });
    }

    await changePassword(req.userId!, oldPassword, newPassword);
    res.json({ message: 'Пароль обновлен' });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message || 'Не удалось сменить пароль' });
  }
};