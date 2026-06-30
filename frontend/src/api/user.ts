import api from './client';
import type { User } from '../types/user';

export const updateProfile = async (payload: { name?: string; avatarUrl?: string }) => {
  const response = await api.put<{ user: User }>('/api/profile', payload);
  return response.data.user;
};

export const changePassword = async (payload: {
  oldPassword: string;
  newPassword: string;
}) => {
  const response = await api.put<{ message: string }>('/api/change-password', payload);
  return response.data;
};