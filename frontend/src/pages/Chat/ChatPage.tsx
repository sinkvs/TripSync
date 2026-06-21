import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import {
    FiSearch,
    FiMoreVertical,
    FiPaperclip,
    FiSmile,
    FiSend,
    FiBellOff,
} from 'react-icons/fi';

export const ChatPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tripId = searchParams.get('tripId'); // получаем ID поездки из URL

    // Состояния
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [tripTitle, setTripTitle] = useState('Беседа');
    const messagesEndRef = useRef<HTMLDivElement>(null); // для прокрутки вниз
    const [showMenu, setShowMenu] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    // Загрузка данных (мок)
    useEffect(() => {
        console.log('Страница чата загружена с tripId =', tripId);
        if (!tripId) {
            navigate('/chats'); // если нет ID – возвращаемся к списку
            return;
        }

        // Мок-сообщения для этой поездки
        const mockData: Record<string, { title: string; messages: any[] }> = {
            '1': {
                title: 'Тюмень – Москва',
                messages: [
                    {
                        id: 1,
                        content: 'Привет! Когда вылетаем?',
                        createdAt: '2026-07-10T14:30:00.000Z',
                        user: { name: 'Анна' },
                        isRead: true, // прочитано
                    },
                    {
                        id: 2,
                        content: 'Завтра в 10 утра, не опаздывай!',
                        createdAt: '2026-07-10T14:32:00.000Z',
                        user: { name: 'Дмитрий' },
                        isRead: false, // не прочитано
                    },
                ],
            },
            '2': {
                title: 'Санкт-Петербург – Сочи',
                messages: [
                    {
                        id: 3,
                        content: 'Когда встречаемся?',
                        createdAt: '2026-08-01T09:00:00.000Z',
                        user: { name: 'Ольга' },
                        isRead: true,
                    },
                    {
                        id: 4,
                        content: 'Завтра в 12:00 на вокзале',
                        createdAt: '2026-08-01T09:05:00.000Z',
                        user: { name: 'Петр' },
                        isRead: false,
                    },
                ],
            },
        };

        // В реальном приложении здесь будет запрос к API:
        // GET /api/trips/${tripId}/messages?limit=50
        // и получение названия поездки: GET /api/trips/${tripId}

        const data = mockData[tripId] || mockData['1'];
        setTripTitle(data.title);
        setMessages(data.messages);
        setLoading(false);
    }, [tripId, navigate]);

    // Отправка нового сообщения (локально)
    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const newMsg = {
            id: Date.now(), // временный ID
            content: newMessage.trim(),
            createdAt: new Date().toISOString(),
            user: { name: 'Я' },
            isRead: false, // новое сообщение считается непрочитанным
        };

        setMessages([...messages, newMsg]);
        setNewMessage('');
        // Прокручиваем вниз после отправки
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Форматирование времени (часы:минуты)
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    };

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

            {/* Основной контент */}
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Шапка: кнопка "Назад" + название поездки */}
                <div className="mx-4 mt-2 mb-1 py-2 px-4 bg-white/60 backdrop-blur-sm border border-white/20 rounded-full shadow-sm flex items-center justify-between">
                    {/* Левая часть - кнопка назад */}
                    <button
                        onClick={() => navigate('/chats')}
                        className="text-2xl text-black p-2"
                    >
                        <FiArrowLeft />
                    </button>

                    {/* Центр - название поездки */}
                    <div className="font-bold text-lg text-black">
                        {tripTitle}
                    </div>

                    {/* Правая часть - иконки поиска и меню */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className="w-8 h-8 flex items-center justify-center text-xl text-gray-700 hover:text-black transition"
                        >
                            <FiSearch />
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="w-8 h-8 flex items-center justify-center text-xl text-gray-700 hover:text-black transition"
                            >
                                <FiMoreVertical />
                            </button>
                            {showMenu && (
                                <div
                                    className="fixed right-4 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-[9999]"
                                    style={{ top: '80px' }}
                                >
                                    <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <FiBellOff /> Выключить уведомления
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Область сообщений */}
                <div className="flex-1 px-6 py-4 overflow-y-auto pb-28">
                    {loading && <p className="text-white text-center">Загрузка...</p>}
                    {!loading && messages.length === 0 && (
                        <p className="text-white text-center">Нет сообщений</p>
                    )}

                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow">
                                <div className="flex items-start gap-3">
                                    {/* Аватарка (первая буква имени) */}
                                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-xl">
                                        {msg.user?.name?.[0] || '?'}
                                    </div>
                                    <div className="flex-1">
                                        {/* Имя отправителя */}
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-gray-800">{msg.user?.name || 'Пользователь'}</span>
                                            {/* Статус (сначала галочка, потом время) */}
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs text-black-500">
                                                    {msg.isRead ? '✓✓' : '✓'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {formatTime(msg.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Текст сообщения */}
                                        <p className="text-gray-700 mt-1">{msg.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Поле ввода и кнопка отправки */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm p-4">
                    <form onSubmit={sendMessage} className="flex gap-2 max-w-md mx-auto">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Сообщение..."
                            className="flex-1 border-2 border-black rounded-xl px-4 py-2 bg-white/90 focus:outline-none mr-2"
                        />
                        <button
                            type="submit"
                            className="bg-black text-white font-semibold px-6 py-2 rounded-xl hover:bg-gray-800 transition mr-2"
                        >
                            Отправить
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};