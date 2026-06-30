import api from './client';
import type { User } from '../types/user';
import type { Trip } from '../types/trip';

export const getAdminDashboard = async () => {
  const response = await api.get<{ users: User[]; trips: Trip[] }>('/admin/users');
  return response.data;
};

export const blockUser = async (id: number) => {
  await api.post(`/admin/users/${id}/block`);
};

export const unblockUser = async (id: number) => {
  await api.post(`/admin/users/${id}/unblock`);
};

export const deleteTripAsAdmin = async (id: number) => {
  await api.delete(`/admin/trips/${id}`);
};