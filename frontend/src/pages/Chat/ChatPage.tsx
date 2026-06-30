import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiMoreVertical, FiPaperclip, FiSmile, FiSend, FiBellOff, FiBookmark } from 'react-icons/fi';
import { getMessages, sendMessage as apiSendMessage, deleteMessage as apiDeleteMessage, searchMessages } from '../../api/chat';
import { useWebSocket } from '../../hooks/useWebSocket';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/useAuthStore';
import api from '../../api/client';

interface ChatMessage {
    id: number;
    content: string;
    createdAt: string;
    senderId: number | null;
    user: { id?: number; name: string };
    isRead: boolean;
    messageType?: string;
    isPinned?: boolean;
}

// Нормализация данных сообщения
const normalizeMessage = (message: any, currentUserId: number): ChatMessage => {
    const senderId = Number(
        message.senderId ?? message.sender_id ?? message.sender?.id ?? message.userId ?? message.sender?.userId
    ) || null;
    const senderName = message.sender?.name || message.user?.name || message.senderName || (senderId === currentUserId ? 'Вы' : 'Пользователь');
    const isRead = typeof message.isRead === 'boolean'
        ? message.isRead
        : Array.isArray(message.readBy)
            ? message.readBy.includes(currentUserId)
            : false;
    return {
        id: Number(message.id),
        content: message.content || '',
        createdAt: message.createdAt || new Date().toISOString(),
        senderId,
        user: { id: senderId ?? undefined, name: senderName },
        isRead,
        messageType: message.messageType || message.message_type,
        isPinned: message.isPinned || false,
    };
};

export const ChatPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const currentUserId = user?.id || Number(localStorage.getItem('userId')) || 0;
    const [searchParams] = useSearchParams();
    const tripId = searchParams.get('tripId');

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [tripTitle, setTripTitle] = useState('Беседа');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showMenu, setShowMenu] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [error, setError] = useState<string>('');
    const [selectedMsgId, setSelectedMsgId] = useState<number | null>(null);
    const [searchResults, setSearchResults] = useState<any[] | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Закрытие меню удаления при клике вне сообщения
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

    const pinnedMessages = useMemo(() => messages.filter(msg => msg.isPinned), [messages]);
    const displayMessages = useMemo(() => {
        if (showSearch && searchQuery.trim() && searchResults !== null) return searchResults;
        return messages;
    }, [showSearch, searchQuery, searchResults, messages]);

    // Поиск сообщений с debounce
    useEffect(() => {
        const performSearch = async () => {
            if (!showSearch || !searchQuery.trim()) {
                setSearchResults(null);
                return;
            }
            try {
                const results = await searchMessages(Number(tripId), searchQuery);
                setSearchResults(results);
            } catch (err) {
                console.error('Ошибка поиска:', err);
                setSearchResults([]);
            }
        };
        const timer = setTimeout(performSearch, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, showSearch, tripId]);

    // Загрузка сообщений с пагинацией
    const loadMessages = async (skip: number, append: boolean = false) => {
        if (!tripId) return;
        try {
            if (append) setLoadingMore(true);
            else setLoading(true);
            const rawMsgs = await getMessages(Number(tripId), 20, skip);
            const normalized = rawMsgs.map((msg: any) => normalizeMessage(msg, currentUserId));
            if (append) {
                const prevHeight = containerRef.current?.scrollHeight || 0;
                setMessages(prev => [...normalized, ...prev]);
                setTimeout(() => {
                    if (containerRef.current) {
                        const delta = containerRef.current.scrollHeight - prevHeight;
                        containerRef.current.scrollTop += delta;
                    }
                }, 0);
                if (rawMsgs.length < 20) setHasMore(false);
            } else {
                setMessages(normalized);
                setHasMore(rawMsgs.length === 20);
                // Получение названия поездки
                try {
                    const tripRes = await api.get(`/trips/${tripId}`);
                    setTripTitle(tripRes.data.trip.title);
                } catch {
                    // если не загрузилось, остаётся "Беседа"
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка загрузки');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (!tripId) {
            navigate('/chats');
            return;
        }
        setPage(0);
        loadMessages(0, false);
    }, [tripId]);

    // Бесконечная прокрутка вверх
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const handleScroll = () => {
            if (!containerRef.current || loadingMore || !hasMore) return;
            if (containerRef.current.scrollTop <= 10) {
                setPage(prev => {
                    const nextPage = prev + 1;
                    loadMessages(nextPage * 20, true);
                    return nextPage;
                });
            }
        };
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [loadingMore, hasMore, page]);

    // Отправка сообщения
    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !tripId) return;
        try {
            const rawMsg = await apiSendMessage(Number(tripId), newMessage.trim());
            const newMsg = normalizeMessage(rawMsg, currentUserId);
            setMessages(prev => [...prev, newMsg]);
            setNewMessage('');
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            console.error('Ошибка отправки:', err);
            toast.error('Не удалось отправить сообщение');
        }
    };

    // Закрепление сообщения
    const togglePin = async (msgId: number) => {
        try {
            const response = await api.patch(`/chats/messages/${msgId}/pin`);
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === msgId ? { ...msg, isPinned: response.data.message.isPinned } : msg
                )
            );
        } catch (err) {
            console.error('Ошибка закрепления:', err);
        }
    };

    // Удаление сообщения
    const handleDeleteMessage = async (msgId: number) => {
        try {
            await apiDeleteMessage(msgId);
            setMessages(prev => prev.filter(msg => msg.id !== msgId));
            toast.success('Сообщение удалено');
        } catch (err) {
            console.error('Ошибка удаления:', err);
            toast.error('Не удалось удалить сообщение');
        }
    };

    // WebSocket
    useWebSocket(tripId, (data) => {
        if (data.type === 'new_message') {
            const newMsg = normalizeMessage(data.message, currentUserId);
            if (newMsg.senderId === currentUserId) return;
            setMessages(prev => [...prev, newMsg]);
            toast.success(`Новое сообщение от ${newMsg.user.name}`);
        }
    });

    // Скролл к сообщению
    const scrollToMessage = (msgId: number) => {
        const el = document.getElementById(`msg-${msgId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;

    return (
        <div
            className="h-screen flex flex-col overflow-hidden"
            style={{
                backgroundImage: "url('/images/trips.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div className="relative z-10 flex flex-col h-full">
                {/* Шапка */}
                <div className="mx-4 mt-2 mb-1 py-2 px-4 bg-white/60 backdrop-blur-sm border border-white/20 rounded-full shadow-sm flex items-center justify-between z-20">
                    <button onClick={() => navigate('/chats')} className="text-2xl text-black p-2">
                        <FiArrowLeft />
                    </button>
                    <div className="font-bold text-lg text-black">{tripTitle}</div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowSearch(!showSearch)} className="w-8 h-8 flex items-center justify-center text-xl text-gray-700 hover:text-black transition">
                            <FiSearch />
                        </button>
                        <div className="relative">
                            <button onClick={() => setShowMenu(!showMenu)} className="w-8 h-8 flex items-center justify-center text-xl text-gray-700 hover:text-black transition">
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

                {/* Поиск */}
                {showSearch && (
                    <div className="px-4 py-1 backdrop-blur-sm">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Поиск по сообщениям..."
                            className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none"
                        />
                    </div>
                )}

                {/* Закреплённые сообщения */}
                {pinnedMessages.length > 0 && (
                    <div className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm mx-4 mb-2 flex-shrink-0">
                        <div className="text-xs text-black font-semibold mb-1">Закреплённое</div>
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

                {/* Сообщения */}
                <div ref={containerRef} className="flex-1 px-4 py-4 overflow-y-auto">
                    {loading && <p className="text-center text-gray-500">Загрузка...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    {!loading && messages.length === 0 && (
                        <p className="text-center text-gray-500">Нет сообщений</p>
                    )}
                    <div className="space-y-2">
                        {displayMessages.map((msg) => {
                            const isMy = msg.senderId === currentUserId;
                            return (
                                <div id={`msg-${msg.id}`} key={msg.id} className={`flex ${isMy ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] flex ${isMy ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                                        {!isMy && (
                                            <div className="w-8 h-8 rounded-full bg-green-950 flex items-center justify-center text-white flex-shrink-0">
                                                {msg.user?.name?.[0] || '?'}
                                            </div>
                                        )}
                                        <div className="relative">
                                            <div
                                                onClick={() => setSelectedMsgId(selectedMsgId === msg.id ? null : msg.id)}
                                                className={`px-4 py-2 rounded-2xl shadow-sm message-bubble ${isMy
                                                        ? 'bg-black/80 backdrop-blur-sm text-white rounded-br-none'
                                                        : 'bg-green-950/50 backdrop-blur-sm text-black rounded-br-none'
                                                    }`}
                                            >
                                                {!isMy && (
                                                    <div className="font-bold text-sm text-white mb-1">{msg.user?.name || 'Пользователь'}</div>
                                                )}
                                                <p className="text-sm break-words">{msg.content}</p>
                                                <div className="flex items-center justify-end gap-1 mt-1 text-xs">
                                                    <span className={msg.isRead ? 'text-green-950 font-bold' : 'text-gray-400'}>
                                                        {msg.isRead ? '✓✓' : '✓'}
                                                    </span>
                                                    <button onClick={() => togglePin(msg.id)} className="ml-1 focus:outline-none">
                                                        <FiBookmark className={`w-3 h-3 ${msg.isPinned ? 'text-white' : 'text-gray-400'}`} />
                                                    </button>
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
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Поле ввода */}
                <div className="flex-shrink-0 p-3 bg-white/80 backdrop-blur-sm">
                    <form onSubmit={sendMessage} className="flex items-center gap-2 w-full bg-gray-100 rounded-full px-4 py-1">
                        <div className="relative">
                            <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-xl text-gray-500">
                                <FiSmile />
                            </button>
                            {showEmojiPicker && (
                                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-2 flex flex-wrap gap-1 w-64">
                                    {['😊', '😂', '❤️', '🔥', '👍', '👏', '😍', '🤔', '😎', '🎉', '✨', '💪'].map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => { setNewMessage(prev => prev + emoji); setShowEmojiPicker(false); }}
                                            className="text-2xl hover:bg-gray-100 rounded p-1"
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
                        <button type="button" onClick={() => setShowAttachmentMenu(!showAttachmentMenu)} className="text-xl text-gray-500">
                            <FiPaperclip />
                        </button>
                        <button type="submit" className="text-xl text-black-600"><FiSend /></button>
                        {showAttachmentMenu && (
                            <div className="absolute bottom-full right-1 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-2 flex flex-col gap-1 w-40">
                                <button
                                    onClick={() => {
                                        setShowAttachmentMenu(false);
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = 'image/*';
                                        input.onchange = (e) => {
                                            const file = (e.target as HTMLInputElement).files?.[0];
                                            if (file) setNewMessage(prev => prev + ` [Фото: ${file.name}]`);
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
                                        fileInputRef.current?.click();
                                    }}
                                    className="text-sm text-left px-3 py-2 hover:bg-gray-100 rounded"
                                >
                                    Файл
                                </button>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) { setNewMessage(prev => prev + ` [Файл: ${file.name}]`); e.target.value = ''; }
                        }} />
                    </form>
                </div>
            </div>
        </div>
    );
};