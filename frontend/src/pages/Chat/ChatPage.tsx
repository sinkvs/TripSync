import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { FiSearch, FiMoreVertical, FiPaperclip, FiSmile, FiSend, FiBellOff, FiBookmark, } from 'react-icons/fi';
import { getMessages, sendMessage as apiSendMessage, deleteMessage as apiDeleteMessage } from '../../api/chat';
import axios from 'axios';

export const ChatPage = () => {
    const navigate = useNavigate();
    const currentUserId = Number(localStorage.getItem('userId')) || 0;
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
    const [searchQuery, setSearchQuery] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [error, setError] = useState<string>('');
    const [selectedMsgId, setSelectedMsgId] = useState<number | null>(null);

// По клику на другой области кнопка "удалить" исчезает
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.message-bubble') && !target.closest('.delete-button')) {
                setSelectedMsgId(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Поиск сообщений
    const filteredMessages = useMemo(() => {
        if (!searchQuery.trim()) return messages;
        return messages.filter(msg =>
            msg.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [messages, searchQuery]);


    // Закреплённые сообщения - отдельный список для блока вверху
    const pinnedMessages = useMemo(() => {
        return messages.filter(msg => msg.isPinned);
    }, [messages]);

    useEffect(() => {
        // Асинхронная функция для загрузки данных
        const fetchData = async () => {
            // 1. Проверяем, что tripId есть – если нет, возвращаемся на список чатов
            if (!tripId) {
                navigate('/chats');
                return;
            }

            try {
                // 2. Показываем индикатор загрузки
                setLoading(true);
                // 3. Сбрасываем предыдущую ошибку
                setError('');

                // 4. Получаем токен из localStorage
                const token = localStorage.getItem('token');
                if (!token) {
                    // Если токена нет - отправляем на логин
                    navigate('/login');
                    return;
                }

                // 5. Загружаем название поездки (через tripsApi – используем axios)
                const tripRes = await axios.get(`http://localhost:5000/api/trips/${tripId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTripTitle(tripRes.data.trip.title);

                // 6. Загружаем сообщения через наш API-клиент
                const msgs = await getMessages(Number(tripId), token);
                setMessages(msgs);
            } catch (err: any) {
                
                // 7. Обрабатываем ошибку
                console.error('Ошибка загрузки чата:', err);
                setError('Не удалось загрузить сообщения');

                // 8. Если ошибка 401 (Unauthorized) – токен недействителен
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } finally {
                // 9. В любом случае снимаем флаг загрузки
                setLoading(false);
            }
        };

        // Вызываем функцию загрузки
        fetchData();
    }, [tripId, navigate]);

    // Отправка нового сообщения (локально)
    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Проверяем, что есть текст и tripId
        if (!newMessage.trim() || !tripId) {
            return;
        }

        try {
            // 2. Получаем токен
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            // 3. Отправляем сообщение через API-клиент
            const newMsg = await apiSendMessage(Number(tripId), newMessage.trim(), token);

            // 4. Добавляем новое сообщение в конец списка
            setMessages(prev => [...prev, newMsg]);

            // 5. Очищаем поле ввода
            setNewMessage('');

            // 6. Прокручиваем вниз
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            // 7. Обрабатываем ошибку
            console.error('Ошибка отправки:', err);
            alert('Не удалось отправить сообщение');
        }
    };

    // Форматирование времени (часы:минуты)
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    };

    // Переключает закрепление сообщения по id
    const togglePin = (msgId: number) => {
        setMessages(prev =>
            prev.map(msg =>
                msg.id === msgId ? { ...msg, isPinned: !msg.isPinned } : msg
            )
        );
    };

    // Прокручивает к сообщению с указанным id
    const scrollToMessage = (msgId: number) => {
        const element = document.getElementById(`msg-${msgId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // Удаление сообщения
    const handleDeleteMessage = async (msgId: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            // Отправляем запрос на удаление
            await apiDeleteMessage(msgId, token);

            // Удаляем сообщение из локального состояния (чтобы оно сразу исчезло)
            setMessages(prev => prev.filter(msg => msg.id !== msgId));
        } catch (err) {
            console.error('Ошибка удаления:', err);
            alert('Не удалось удалить сообщение');
        }
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
                <div className="mx-4 mt-2 mb-1 py-2 px-4 bg-white/60 backdrop-blur-sm border border-white/20 rounded-full shadow-sm flex items-center justify-between z-20">
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
                                onClick={() => {
                                    setShowMenu(!showMenu);
                                    console.log('showMenu:', !showMenu);
                                }}
                                className="w-8 h-8 flex items-center justify-center text-xl text-gray-700 hover:text-black transition"
                            >
                                <FiMoreVertical />
                            </button>
                            {showMenu && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-[99999]">
                                    <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <FiBellOff /> Выключить уведомления
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Область поиска сообщений */}
                {showSearch && (
                    <div className="px-4 py-1 backdrop-blur-sm border-gray-200">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Поиск по сообщениям..."
                            className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none"
                        />
                    </div>
                )}

                {/* Область сообщений */}
                <div className="flex-1 px-4 py-4 overflow-y-auto pb-28">
                    {loading && <p className="text-center text-gray-500">Загрузка...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    {!loading && messages.length === 0 && (
                        <p className="text-center text-gray-500">Нет сообщений</p>
                    )}

                    {/* Закреплённые сообщения */}
                    {pinnedMessages.length > 0 && (
                        <div className="mb-3 px-3 py-2 bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm">
                            <div className="text-xs text-black font-semibold mb-1 flex items-center gap-1">
                                Закреплённое сообщение
                            </div>
                            <div className="space-y-0.5">
                                {pinnedMessages.map((msg) => (
                                    <div
                                        key={`pinned-${msg.id}`}
                                        className="text-sm text-gray-700 truncate cursor-pointer hover:text-blue-600 transition"
                                        onClick={() => scrollToMessage(msg.id)}
                                    >
                                        {msg.content}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        {filteredMessages.map((msg) => {
                            // Определяем, моё ли это сообщение (по имени отправителя)
                            const isMy = msg.sender?.id === currentUserId;
                            return (
                                // Контейнер для одного сообщения: свои справа, чужие слева
                                <div id={`msg-${msg.id}`} key={msg.id} className={`flex ${isMy ? 'justify-end' : 'justify-start'}`}>
                                    {/* Внутренняя обертка */}
                                    <div className={`max-w-[75%] flex ${isMy ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                                        {/* Аватарка - только для чужих сообщений */}
                                        {!isMy && (
                                            <div className="w-8 h-8 rounded-full bg-green-950  flex items-center justify-center text-m text-white flex-shrink-0">
                                                {msg.sender?.name?.[0] || '?'}
                                            </div>
                                        )}
                                        {/* Сам пузырек сообщения */}
                                        <div className="relative">
                                            <div
                                                onClick={() => setSelectedMsgId(selectedMsgId === msg.id ? null : msg.id)}
                                                className={`px-4 py-2 rounded-2xl shadow-sm message-bubble 
                                                    ${isMy
                                                        ? 'bg-black/80 backdrop-blur-sm text-white rounded-br-none'   // свои сообщения
                                                        : 'bg-green-950/50 backdrop-blur-sm text-black rounded-br-none' // чужие сообщения
                                                    }`}
                                            >
                                                {/* Имя отправителя - только для чужих сообщений */}
                                                {!isMy && (
                                                    <div className="font-bold text-sm text-white mb-1">
                                                        {msg.sender?.name || 'Пользователь'}
                                                    </div>
                                                )}
                                                {/* Текст сообщения */}
                                                <p className="text-sm break-words">{msg.content}</p>
                                                {/* Время и статус прочтения - под текстом, справа */}
                                                <div className="flex items-center justify-end gap-1 mt-1 text-xs">
                                                    {(() => {
                                                        const isRead = msg.readBy?.includes(currentUserId) ?? false;
                                                        return (
                                                            <span className={`${isRead ? 'text-green-950 font-bold' : 'text-gray-400'}`}>
                                                                {isRead ? '✓✓' : '✓'}
                                                            </span>
                                                        );

                                                    })()}
                                                    <button
                                                        onClick={() => togglePin(msg.id)}
                                                        className="ml-1 focus:outline-none"
                                                    >
                                                        <FiBookmark
                                                            className={`w-3 h-3 ${msg.isPinned ? 'text-white' : 'text-gray-400'}`}
                                                        />
                                                    </button>

                                                    {/* Кнопка удаления – только для своих сообщений */}
                                                    {isMy && selectedMsgId === msg.id && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteMessage(msg.id);
                                                                setSelectedMsgId(null);
                                                            }}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-lg hover:bg-red-600 transition"
                                                        >
                                                            Удалить
                                                        </button>
                                                    )}
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
                        <div className="relative">
                            {/* Область со смайликами */}
                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="text-xl text-gray-500"
                            >
                                <FiSmile />
                            </button>
                            {showEmojiPicker && (
                                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-2 flex flex-wrap gap-1 w-64">
                                    {['😊', '😂', '❤️', '🔥', '👍', '👏', '😍', '🤔', '😎', '🎉', '✨', '💪'].map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => {
                                                setNewMessage(prev => prev + emoji);
                                                setShowEmojiPicker(false);
                                            }}
                                            className="text-2xl hover:bg-gray-100 rounded p-1 transition"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Сообщение..."
                            className="flex-1 bg-transparent px-2 py-2 text-sm focus:outline-none"
                        />
                        {/* Кнопка скрепки с меню */}
                        <button
                            type="button"
                            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                            className="text-xl text-gray-500"
                        >
                            <FiPaperclip />
                        </button>
                        <button type="submit" className="text-xl text-black-600"><FiSend /></button>
                        {showAttachmentMenu && (
                            <div className="absolute bottom-full right-1 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-2 flex flex-col gap-1 w-40">
                                <button
                                    onClick={() => {
                                        setShowAttachmentMenu(false);
                                        // открываем выбор фото 
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = 'image/*';
                                        input.onchange = (e) => {
                                            const file = (e.target as HTMLInputElement).files?.[0];
                                            if (file) {
                                                setNewMessage(prev => prev + ` [Фото: ${file.name}]`);
                                            }
                                        };
                                        input.click();
                                    }}
                                    className="text-sm text-left px-3 py-2 hover:bg-gray-100 rounded"
                                >
                                    Фото
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAttachmentMenu(false);
                                        // открываем выбор файла
                                        fileInputRef.current?.click();
                                    }}
                                    className="text-sm text-left px-3 py-2 hover:bg-gray-100 rounded"
                                >
                                    Файл
                                </button>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setNewMessage(prev => prev + ` [Файл: ${file.name}]`);
                                    e.target.value = ''; // сброс
                                }
                            }}
                        />
                    </form>
                </div>
            </div>
        </div >
    );
};