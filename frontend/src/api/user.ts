import api from './client';
import type { User } from '../types/user';

// Обновление профиля пользователя
export const updateProfile = async (payload: { name?: string; avatarUrl?: string }) => {
  const response = await api.put<{ user: User }>('/api/user/profile', payload);
  return response.data.user;
};

// Смена пароля
export const changePassword = async (payload: {
  oldPassword: string;
  newPassword: string;
}) => {
  const response = await api.put<{ message: string }>('/api/user/password', payload);
  return response.data;
};