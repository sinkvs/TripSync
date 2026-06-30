import axios from 'axios';

// Создаём экземпляр axios без baseURL
// Все запросы будут идти на относительный путь (пример, /api/trips),
// а Vite прокси перенаправит их на бэкенд (http://localhost:5000)
const api = axios.create();

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;