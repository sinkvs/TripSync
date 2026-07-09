import api from './client';

// Получение списка чатов пользователя
export const getChats = async () => {
  const response = await api.get('/api/chats');
  return response.data.chats;
};

// Получение сообщений поездки с пагинацией
export const getMessages = async (tripId: number, limit: number = 50, skip: number = 0) => {
  const response = await api.get(`/api/trips/${tripId}/messages?limit=${limit}&skip=${skip}`);
  return response.data.messages;
};

// Отправка нового сообщения
export const sendMessage = async (tripId: number, content: string) => {
  const response = await api.post(`/api/trips/${tripId}/messages`, { content });
  return response.data.message;
};

// Удаление сообщения
export const deleteMessage = async (messageId: number) => {
  await api.delete(`/api/chats/messages/${messageId}`);
};

// Поиск по сообщениям поездки
export const searchMessages = async (tripId: number, query: string) => {
  const response = await api.get(`/api/trips/${tripId}/messages/search?q=${encodeURIComponent(query)}`);
  return response.data.messages;
};

// Закрепление сообщения
export const togglePin = async (messageId: number) => {
  const response = await api.patch(`/api/chats/messages/${messageId}/pin`);
  return response.data.message;
};