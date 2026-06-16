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

    // Состояния для формы добавления события
    const [newType, setNewType] = useState('flight');
    const [newTitle, setNewTitle] = useState('');
    const [newStartDateTime, setNewStartDateTime] = useState('');
    const [newLocationCoords, setNewLocationCoords] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                // Ожидаем, что бэк вернет { events: [...] }
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

    // Создание нового события
    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            const response = await axios.post(
                `http://localhost:5000/api/trips/${id}/events`,
                {
                    type: newType,
                    title: newTitle,
                    startDateTime: newStartDateTime,
                    locationCoords: newLocationCoords || undefined,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEvents(prev => [...prev, response.data.event]);
            // Очищаем форму
            setNewTitle('');
            setNewStartDateTime('');
            setNewLocationCoords('');
            setNewType('flight');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Ошибка создания события');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Показываем индикатор загрузки
    if (loading)
        return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;

    // Показываем ошибку, если она есть
    if (error)
        return <div className="min-h-screen flex items-center justify-center text-red-500">Ошибка: {error}</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <h1 className="text-2xl font-bold mb-4">Таймлайн поездки</h1>

            {/* Форма добавления события */}
            <div className="bg-white p-4 rounded shadow mb-6">
                <h2 className="text-lg font-semibold mb-2">Добавить событие</h2>
                <form onSubmit={handleCreateEvent} className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium">Тип</label>
                        <select
                            value={newType}
                            onChange={(e) => setNewType(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="flight">Перелёт</option>
                            <option value="hotel">Отель</option>
                            <option value="event">Событие</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Название</label>
                        <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            required
                            placeholder="Например, Перелёт Москва-Сочи"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Дата и время начала</label>
                        <input
                            type="datetime-local"
                            value={newStartDateTime}
                            onChange={(e) => setNewStartDateTime(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Координаты (опционально)</label>
                        <input
                            type="text"
                            value={newLocationCoords}
                            onChange={(e) => setNewLocationCoords(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            placeholder="55.751244,37.618423"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Сохранение...' : 'Добавить событие'}
                    </button>
                </form>
            </div>

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