import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getChats } from '../../api/chat';
import { useAuthStore } from '../../stores/useAuthStore';

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
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

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

  // При первом рендере
  useEffect(() => {
    fetchChats();
  }, []);

  // При каждом переходе на /chats (включая возврат из чата)
  useEffect(() => {
    if (location.pathname === '/chats') {
      fetchChats();
    }
  }, [location.pathname]);

  // При возврате на вкладку (фокус)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && location.pathname === '/chats') {
        fetchChats();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [location.pathname]);

  const openChat = (tripId: number) => {
    navigate(`/chat?tripId=${tripId}`);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-lg">Загрузка чатов...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

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
        {/* Шапка */}
        <div className="bg-white/30 backdrop-blur-sm px-6 pt-6 pb-2 rounded-b-xl">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/trips')}
              className="font-bold text-center rounded-xl"
              style={{ fontSize: '28px', color: 'black', border: '3px solid black', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ←
            </button>
            <div
              className="font-bold text-center px-10 py-1 rounded-xl"
              style={{ fontSize: '22px', color: 'black', border: '3px solid black', display: 'inline-block', height: '48px' }}
            >
              Чаты
            </div>
            <div className="w-8"></div>
          </div>
        </div>

        {/* Список чатов */}
        <div className="flex-1 px-6 py-4 overflow-y-auto pb-28">
          {chats.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-6 text-center">
              <p className="text-gray-800 font-medium">Нет чатов. Создайте поездку или примите приглашение.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => openChat(chat.id)}
                  className="bg-gray-100/50 backdrop-blur-sm border border-gray-100 rounded-xl p-4 cursor-pointer hover:bg-gray-100/70 transition"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-800 text-lg">{chat.title}</h3>
                    {chat.lastMessage && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {chat.lastMessage.readBy?.includes(currentUserId) ? '✓✓' : '✓'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(chat.lastMessage.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">
                    {new Date(chat.startDate).toLocaleDateString('ru-RU')} — {new Date(chat.endDate).toLocaleDateString('ru-RU')}
                  </p>
                  {chat.lastMessage ? (
                    <p className="text-gray-500 text-sm mt-1 truncate">
                      {chat.lastMessage.sender?.name}: {chat.lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm mt-1">Нет сообщений</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Нижняя навигация */}
        <div className="py-4 px-6 flex justify-around items-center bg-white/60 backdrop-blur-sm border border-white/20 rounded-full mx-4 shadow-sm">
          <button onClick={() => navigate('/weather')} className="flex flex-col items-center gap-0.5">
            <img src="/icons/weather.png" alt="Погода" className="w-8 h-8" />
            <span className="text-[10px] text-gray-700">Погода</span>
          </button>
          <div className="w-px h-8 bg-gray-300"></div>
          <button onClick={() => navigate('/map')} className="flex flex-col items-center gap-0.5">
            <img src="/icons/map.png" alt="Карта" className="w-8 h-8" />
            <span className="text-[10px] text-gray-700">Карта</span>
          </button>
          <div className="w-px h-8 bg-gray-300"></div>
          <button onClick={() => navigate('/chats')} className="flex flex-col items-center gap-0.5">
            <img src="/icons/chat.png" alt="Чат" className="w-8 h-8" />
            <span className="text-[10px] text-gray-700">Чат</span>
          </button>
          <div className="w-px h-8 bg-gray-300"></div>
          <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-0.5">
            <img src="/icons/profile.png" alt="Профиль" className="w-8 h-8" />
            <span className="text-[10px] text-gray-700">Профиль</span>
          </button>
        </div>
      </div>
    </div>
  );
};