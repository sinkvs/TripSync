import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getChats } from '../../api/chat';
import { BottomNav } from '../../components/layout/BottomNav';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { useAuthStore } from '../../stores/useAuthStore';
import { goToTimelineHome, setActiveTripId } from '../../utils/tripNavigation';

// Тип данных чата
interface Chat {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  lastMessage: {
    id: number;
    content: string;
    createdAt: string;
    sender: { name: string };
    readBy: number[];
  } | null;
}

export const ChatListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const currentUserId = user?.id || 0;
  // Состояния списка чатов
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Загрузка списка чатов с сервера
  const fetchChats = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getChats();
      setChats(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Ошибка загрузки чатов:', err);
      setError('Не удалось загрузить чаты');
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка при монтировании
  useEffect(() => {
    fetchChats();
  }, []);

  // Обновление при переходе на страницу чатов
  useEffect(() => {
    if (location.pathname === '/chats') {
      fetchChats();
    }
  }, [location.pathname]);

  // Обновление при возврате на вкладку
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && location.pathname === '/chats') {
        fetchChats();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [location.pathname]);

  // Открытие чата и установка активной поездки
  const openChat = (tripId: number) => {
    setActiveTripId(tripId);
    navigate(`/chat?tripId=${tripId}`);
  };

  // Форматирование времени сообщения
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  // Экран загрузки
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка чатов...</div>;
  }

  // Экран ошибки
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/images/trips.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Заголовок с кнопкой назад */}
        <ScreenHeader
          title="Чаты"
          left={
            <button
              type="button"
              onClick={() => goToTimelineHome(navigate)}
              className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black text-2xl text-black"
            >
              ←
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 sm:px-6">
          {chats.length === 0 ? (
            /* Заглушка при пустом списке */
            <div className="rounded-xl border border-white/30 bg-white/70 p-6 text-center backdrop-blur-sm">
              <p className="font-medium text-gray-800">
                Нет чатов. Создайте поездку или примите приглашение.
              </p>
            </div>
          ) : (
            /* Список чатов */
            <div className="space-y-4">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => openChat(chat.id)}
                  className="cursor-pointer rounded-xl border border-gray-100 bg-gray-100/50 p-4 transition backdrop-blur-sm hover:bg-gray-100/70"
                >
                  {/* Заголовок чата и статус прочтения */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 text-lg font-bold text-gray-800 break-words">{chat.title}</h3>
                    {chat.lastMessage && (
                      <div className="shrink-0 text-right">
                        <div className="text-xs text-gray-500">
                          {chat.lastMessage.readBy?.includes(currentUserId) ? '✓✓' : '✓'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(chat.lastMessage.createdAt)}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Даты поездки */}
                  <p className="text-sm text-gray-600">
                    {new Date(chat.startDate).toLocaleDateString('ru-RU')} —{' '}
                    {new Date(chat.endDate).toLocaleDateString('ru-RU')}
                  </p>
                  {/* Последнее сообщение или заглушка */}
                  {chat.lastMessage ? (
                    <p className="mt-1 truncate text-sm text-gray-500">
                      {chat.lastMessage.sender?.name}: {chat.lastMessage.content}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-400">Нет сообщений</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  );
};