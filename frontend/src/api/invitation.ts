import api from './client';

export const createInvitation = async (tripId: number) => {
  // Бэкенд возвращает { link: "..." } — готовую ссылку
  const response = await api.post<{ link: string }>(`/api/trips/${tripId}/invite`);
  return response.data.link;
};

export const acceptInvitation = async (token: string) => {
  const response = await api.post<{ tripId: number }>(`/api/invitations/${token}`);
  return response.data.tripId;
};