import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Интерфейс для события
interface Event {
  id: number;
  type: string;        // 'flight', 'hotel', 'event'
  title: string;
  startDateTime: string;
  locationCoords?: string;
}

// Страница таймлайна поездки (отображение событий)
export const TimelinePage = () => {
  const { id } = useParams<{ id: string }>(); // id поездки из URL
  const navigate = useNavigate();

  // Состояния для списка событий, загрузки и ошибки
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Загружаем события
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchEvents = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/trips/${id}/events`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Ожидаем, что бэк вернет {events: [...]}
        setEvents(response.data.events || []);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Ошибка загрузки событий');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [id, navigate]);

  // Показываем индикатор загрузки
  if (loading)
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;

  // Показываем ошибку, если она есть
  if (error)
    return <div className="min-h-screen flex items-center justify-center text-red-500">Ошибка: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Таймлайн поездки</h1>

      {/* Список событий */}
      {events.length === 0 ? (
        <p className="text-gray-500">Пока нет событий.</p>
      ) : (
        <div className="space-y-3">
          {events.map(event => (
            <div key={event.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">{event.title}</h3>
              <p className="text-sm text-gray-600">Тип: {event.type}</p>
              <p className="text-sm text-gray-600">
                📅 {new Date(event.startDateTime).toLocaleString()}
              </p>
              {event.locationCoords && <p className="text-sm text-gray-500">📍 {event.locationCoords}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Кнопка назад */}
      <button
        onClick={() => navigate('/trips')}
        className="mt-4 text-gray-500 hover:underline"
      >
        ← Назад к поездкам
      </button>
    </div>
  );
};