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

    // Состояния для редактирования
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editStartDateTime, setEditStartDateTime] = useState('');
    const [editLocationCoords, setEditLocationCoords] = useState('');
    const [editType, setEditType] = useState('flight');

    const fetchEvents = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        setLoading(true);
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
    useEffect(() => {
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

    // Удаление события
    const handleDeleteEvent = async (eventId: number) => {
        if (!window.confirm('Вы уверены, что хотите удалить это событие?')) return;
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(prev => prev.filter(e => e.id !== eventId));
        } catch (err: any) {
            alert('Ошибка удаления события: ' + (err.response?.data?.message || ''));
        }
    };

    // Начать редактирование
    const startEdit = (event: Event) => {
        setEditingEvent(event);
        setEditTitle(event.title);
        setEditStartDateTime(event.startDateTime.slice(0, 16));
        setEditLocationCoords(event.locationCoords || '');
        setEditType(event.type);
    };

    // Сохранить редактирование
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEvent) return;
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await axios.put(
                `http://localhost:5000/api/events/${editingEvent.id}`,
                {
                    type: editType,
                    title: editTitle,
                    startDateTime: editStartDateTime,
                    locationCoords: editLocationCoords || undefined,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEvents(prev =>
                prev.map(ev => (ev.id === editingEvent.id ? response.data.event : ev))
            );
            setEditingEvent(null);
        } catch (err: any) {
            alert('Ошибка обновления: ' + (err.response?.data?.message || ''));
        }
    };
    // Показываем индикатор загрузки
    if (loading)
        return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;

    // Показываем ошибку, если она есть
    if (error)
        return <div className="min-h-screen flex items-center justify-center text-red-500">Ошибка: {error}</div>;

    // Группировка по датам
    const groupedEvents: { [date: string]: Event[] } = {};
    events.forEach(event => {
        const date = new Date(event.startDateTime).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
        if (!groupedEvents[date]) groupedEvents[date] = [];
        groupedEvents[date].push(event);
    });
    const sortedDates = Object.keys(groupedEvents).sort((a, b) => {
        const dateA = new Date(a.split(' ').reverse().join(' '));
        const dateB = new Date(b.split(' ').reverse().join(' '));
        return dateA.getTime() - dateB.getTime();
    });

    const todayStr = new Date().toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    const nextEvent = events.length > 0 ? events[0] : null;

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                backgroundImage: "url('/images/trips.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div className="relative z-10 flex flex-col min-h-screen">
                <div className="bg-white/30 backdrop-blur-sm px-6 pt-6 pb-2 rounded-b-xl">
                    <div className="flex justify-between items-center">
                        <div className="w-8"></div>
                        <div
                            className="font-bold text-center px-10 py-1 rounded-xl"
                            style={{
                                fontSize: "22px",
                                lineHeight: "28px",
                                color: "black",
                                backgroundColor: "transparent",
                                border: "3px solid black",
                                display: "inline-block",
                                height: "48px",
                            }}
                        >
                            Таймлайн
                        </div>
                        <div className="w-8"></div>
                    </div>
                </div>

                {/* Блок "Сегодня + ближайшее событие" */}
                <div className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-4 mb-6 shadow-md">
                    <h2 className="text-lg font-bold text-gray-800">Сегодня, {todayStr}</h2>
                    {nextEvent ? (
                        <div className="mt-2">
                            <p className="text-sm text-gray-600">Ближайшее событие:</p>
                            <p className="font-medium text-black">
                                {nextEvent.title} — {new Date(nextEvent.startDateTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-500 mt-2">Нет предстоящих событий</p>
                    )}
                </div>

                {/* Панель документов */}
                <div className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-4 mb-6 shadow-md">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Документы</h3>
                    <div className="flex justify-around">
                        <div className="text-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto">✈️</div>
                            <span className="text-xs text-gray-600">Flight</span>
                        </div>
                        <div className="text-center">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto">🏨</div>
                            <span className="text-xs text-gray-600">Hotel</span>
                        </div>
                        <div className="text-center">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto">🎫</div>
                            <span className="text-xs text-gray-600">Events</span>
                        </div>
                    </div>
                </div>

                {/* Контент */}
                <div className="flex-1 px-6 py-4 overflow-y-auto pb-28">

                    {/* Список событий по датам */}
                    {events.length === 0 ? (
                        <div className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-6 text-center">
                            <p className="text-gray-800 font-medium">Пока нет событий. Добавьте первое!</p>
                        </div>
                    ) : (
                        sortedDates.map(date => (
                            <div key={date} className="mb-6">
                                <h3 className="text-lg font-semibold text-white bg-black/50 inline-block px-3 py-1 rounded-full backdrop-blur-sm mb-3">
                                    {date === todayStr ? 'Сегодня' : date}
                                </h3>
                                <div className="space-y-3">
                                    {groupedEvents[date].map(event => (
                                        <div
                                            key={event.id}
                                            className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-4 shadow-md"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-black">{event.title}</p>
                                                    <p className="text-sm text-gray-600">Тип: {event.type}</p>
                                                    <p className="text-sm text-gray-600">
                                                        🕒 {new Date(event.startDateTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    {event.locationCoords && (
                                                        <p className="text-sm text-gray-500">📍 {event.locationCoords}</p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => startEdit(event)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteEvent(event.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}

                    {/* Кнопка добавления события */}
                    <button
                        onClick={() => document.getElementById('addEventForm')?.classList.toggle('hidden')}
                        className="w-full bg-black/80 text-white font-semibold py-3 rounded-xl mb-6 hover:bg-black/90 transition backdrop-blur-sm"
                    >
                        + Добавить событие
                    </button>

                    {/* Форма добавления (скрыта) */}
                    <div id="addEventForm" className="hidden bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-4 mb-6 shadow-md">
                        <h3 className="text-lg font-bold mb-3">Новое событие</h3>
                        <form onSubmit={handleCreateEvent} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-800">Тип</label>
                                <select
                                    value={newType}
                                    onChange={(e) => setNewType(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 bg-white/80"
                                >
                                    <option value="flight">Перелёт</option>
                                    <option value="hotel">Отель</option>
                                    <option value="event">Событие</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-800">Название</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 bg-white/80"
                                    required
                                    placeholder="Например, Перелёт Москва-Сочи"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-800">Дата и время</label>
                                <input
                                    type="datetime-local"
                                    value={newStartDateTime}
                                    onChange={(e) => setNewStartDateTime(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 bg-white/80"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-800">Координаты (опционально)</label>
                                <input
                                    type="text"
                                    value={newLocationCoords}
                                    onChange={(e) => setNewLocationCoords(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 bg-white/80"
                                    placeholder="55.751244,37.618423"
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-black text-white font-semibold py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Сохранение...' : 'Добавить'}
                            </button>
                        </form>
                    </div>

                    {/* Модалка редактирования */}
                    {editingEvent && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl p-6 w-96 max-w-full">
                                <h3 className="text-lg font-bold mb-3">Редактировать событие</h3>
                                <form onSubmit={handleEditSubmit} className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium">Тип</label>
                                        <select
                                            value={editType}
                                            onChange={(e) => setEditType(e.target.value)}
                                            className="w-full border rounded-lg px-3 py-2"
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
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="w-full border rounded-lg px-3 py-2"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Дата и время</label>
                                        <input
                                            type="datetime-local"
                                            value={editStartDateTime}
                                            onChange={(e) => setEditStartDateTime(e.target.value)}
                                            className="w-full border rounded-lg px-3 py-2"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Координаты</label>
                                        <input
                                            type="text"
                                            value={editLocationCoords}
                                            onChange={(e) => setEditLocationCoords(e.target.value)}
                                            className="w-full border rounded-lg px-3 py-2"
                                            placeholder="55.751244,37.618423"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-black text-white font-semibold py-2 rounded-lg hover:bg-gray-800"
                                        >
                                            Сохранить
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingEvent(null)}
                                            className="flex-1 bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-400"
                                        >
                                            Отмена
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Кнопка назад */}
                    <button
                        onClick={() => navigate('/trips')}
                        className="mt-4 w-full bg-gray-600/80 text-white font-semibold py-3 rounded-xl hover:bg-gray-700/80 transition backdrop-blur-sm"
                        style={{ backgroundColor: 'rgba(23, 26, 24, 0.77)' }}
                    >
                        ← Назад к поездкам
                    </button>
                </div>
            </div>
        </div>
                );
};