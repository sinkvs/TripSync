import api from './client';

export const getChats = async () => {
  const response = await api.get('/api/chats'); // добавлен /api
  return response.data.chats;
};

export const getMessages = async (tripId: number, limit: number = 50, skip: number = 0) => {
  const response = await api.get(`/api/trips/${tripId}/messages?limit=${limit}&skip=${skip}`);
  return response.data.messages;
};

export const sendMessage = async (tripId: number, content: string) => {
  const response = await api.post(`/api/trips/${tripId}/messages`, { content });
  return response.data.message;
};

export const deleteMessage = async (messageId: number) => {
  await api.delete(`/api/messages/${messageId}`);
};

export const searchMessages = async (tripId: number, query: string) => {
  const response = await api.get(`/api/trips/${tripId}/messages/search?q=${encodeURIComponent(query)}`);
  return response.data.messages;
};