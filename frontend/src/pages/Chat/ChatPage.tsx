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
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-[9999]"
                                    style={{ top: '100%', right: 0 }}
                                >
                                    <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <FiBellOff /> Выключить уведомления
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Область сообщений (в стиле мессенджера) */}
                <div className="flex-1 px-4 py-4 overflow-y-auto pb-28">
                    {loading && <p className="text-center text-gray-500">Загрузка...</p>}
                    {!loading && messages.length === 0 && (
                        <p className="text-center text-gray-500">Нет сообщений</p>
                    )}

                    {/* Область сообщений */}
                    <div className="space-y-2">
                        {messages.map((msg) => {
                            // Определяем, моё ли это сообщение (по имени отправителя)
                            const isMy = msg.user?.name === 'Я';
                            return (
                                // Контейнер для одного сообщения: свои справа, чужие слева
                                <div key={msg.id} className={`flex ${isMy ? 'justify-end' : 'justify-start'}`}>
                                    {/* Внутренняя обертка */}
                                    <div className={`max-w-[75%] flex ${isMy ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                                        {/* Аватарка - только для чужих сообщений */}
                                        {!isMy && (
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm flex-shrink-0">
                                                {msg.user?.name?.[0] || '?'}
                                            </div>
                                        )}
                                        {/* Сам пузырек сообщения */}
                                        <div className="relative">
                                            <div
                                                className={`px-4 py-2 rounded-2xl shadow-sm ${isMy
                                                        ? 'bg-black/80 backdrop-blur-sm text-white rounded-br-none'   // свои сообщения
                                                        : 'bg-green-950/50 backdrop-blur-sm text-white rounded-br-none' // чужие сообщения
                                                    }`}
                                            >
                                                {/* Имя отправителя - только для чужих сообщений */}
                                                {!isMy && (
                                                    <div className="font-bold text-sm text-black mb-1">
                                                        {msg.user?.name || 'Пользователь'}
                                                    </div>
                                                )}
                                                {/* Текст сообщения */}
                                                <p className="text-sm break-words">{msg.content}</p>
                                                {/* Время и статус прочтения - под текстом, справа */}
                                                <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${isMy ? 'text-gray-300' : 'text-gray-400'}`}>
                                                    <span>{formatTime(msg.createdAt)}</span>
                                                    <span>{msg.isRead ? '✓✓' : '✓'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {/* Элемент для прокрутки вниз */}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Поле ввода и кнопка отправки */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <form onSubmit={sendMessage} className="flex items-center gap-2 w-full bg-gray-100 rounded-full px-4 py-1">
                        <button type="button" className="text-xl text-gray-500"><FiSmile /></button>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Сообщение..."
                            className="flex-1 bg-transparent px-2 py-2 text-sm focus:outline-none"
                        />
                        <button type="button" className="text-xl text-gray-500"><FiPaperclip /></button>
                        <button type="submit" className="text-xl text-black-600"><FiSend /></button>
                    </form>
                </div>
            </div>
        </div>
    );
};