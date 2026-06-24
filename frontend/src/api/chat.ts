import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

/**
 * Получить список чатов (поездок с последним сообщением)
 * GET /api/chats
 */
export const getChats = async (token: string) => {
  const response = await axios.get(`${API_BASE}/chats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.chats; // массив объектов чата
};

/**
 * Получить сообщения конкретной поездки
 * GET /api/trips/:tripId/messages?limit=50
 */
export const getMessages = async (tripId: number, token: string, limit: number = 50) => {
  const response = await axios.get(`${API_BASE}/trips/${tripId}/messages?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.messages;
};

/**
 * Отправить новое сообщение
 * POST /api/trips/:tripId/messages
 */
export const sendMessage = async (tripId: number, content: string, token: string) => {
  const response = await axios.post(
    `${API_BASE}/trips/${tripId}/messages`,
    { content },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.message; // объект нового сообщения
};

/**
 * Удалить сообщение по id
 * DELETE /api/messages/:messageId
 */
export const deleteMessage = async (messageId: number, token: string) => {
  await axios.delete(`${API_BASE}/chats/messages/${messageId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};