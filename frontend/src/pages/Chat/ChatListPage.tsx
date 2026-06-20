import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Тип для одного чата
interface Chat {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  lastMessage: {
    id: number;
    content: string;
    createdAt: string;
    user: { name: string };
    isRead: boolean;
  } | null;
}

export const ChatListPage = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  // Мок-данные (потом заменим на запрос к бэкенду)
  useEffect(() => {
    const mockChats: Chat[] = [
      {
        id: 1,
        title: 'Тюмень – Москва',
        startDate: '2026-07-10T12:40:00.000Z',
        endDate: '2026-07-10T15:55:00.000Z',
        lastMessage: {
          id: 10,
          content: 'Привет! Когда вылетаем?',
          createdAt: '2026-07-10T14:30:00.000Z',
          user: { name: 'Анна' },
          isRead: true, // прочитано 
        },
      },
      {
        id: 2,
        title: 'Санкт-Петербург – Сочи',
        startDate: '2026-08-01T08:00:00.000Z',
        endDate: '2026-08-05T20:00:00.000Z',
        lastMessage: null, // нет сообщений
      },
    ];

    setLoading(true);
    setTimeout(() => {
      setChats(mockChats);
      setLoading(false);
    }, 500); // имитация загрузки
  }, []);

  // Переход в конкретный чат
  const openChat = (tripId: number) => {
    navigate(`/chat?tripId=${tripId}`);
  };

  // Форматирование времени
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
      {/* Основной контент (поверх фона)*/}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Кнопка бургер-меню слева */}
        <div className="px-6 pt-6 pb-2 flex justify-between items-center">
          <button onClick={() => navigate("/quick-access")}
            className="font-bold text-center rounded-xl"
            style={{
              fontSize: "28px",
              color: "black",
              backgroundColor: "transparent",
              border: "3px solid black",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ☰
          </button>

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
              marginLeft: "40px",
            }}
          >
            Чаты
          </div>
        </div>

        {/* Список чатов */}
        <div className="flex-1 px-6 py-4 overflow-y-auto pb-28">
          {loading && <p className="text-white text-center">Загрузка...</p>}
          {!loading && chats.length === 0 && (
            <p className="text-white text-center">Нет чатов. Создайте поездку.</p>
          )}
          <div className="space-y-4">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => openChat(chat.id)}
                className="bg-gray-100/50 backdrop-blur-sm border border-gray-100 rounded-xl p-4 mb-6 cursor-pointer hover:bg-gray-100/50 transition"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-800 text-lg">{chat.title}</h3>
                  {chat.lastMessage && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {/* Галочка статуса прочитано/не прочитано */}
                        {chat.lastMessage?.isRead ? '✓✓' : '✓'}
                      </span>
                      <span className="text-xs text-black-500">
                        {formatTime(chat.lastMessage.createdAt)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Даты поездки */}
                <p className="text-gray-600 text-sm">
                  {new Date(chat.startDate).toLocaleDateString('ru-RU')} —{' '}
                  {new Date(chat.endDate).toLocaleDateString('ru-RU')}
                </p>

                {/* Последнее сообщение или заглушка */}
                {chat.lastMessage ? (
                  <p className="text-gray-500 text-sm mt-1 truncate">
                    {chat.lastMessage.user?.name}: {chat.lastMessage.content}
                  </p>
                ) : (
                  <p className="text-gray-400 text-sm mt-1">Нет сообщений</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Кнопки навигации */}
        <div className="py-4 px-6 flex justify-around items-center bg-white/60 backdrop-blur-sm border border-white/20 rounded-full mx-4 shadow-sm">
          <button onClick={() => navigate("/weather")} className="flex flex-col items-center gap-0.5">
            <img src="/icons/weather.png" alt="Погода" className="w-8 h-8" />
            <span className="text-[10px] text-gray-700">Погода</span>
          </button>
          <div className="w-px h-8 bg-gray-300"></div>
          <button onClick={() => navigate("/map")} className="flex flex-col items-center gap-0.5">
            <img src="/icons/map.png" alt="Карта" className="w-8 h-8" />
            <span className="text-[10px] text-gray-700">Карта</span>
          </button>
          <div className="w-px h-8 bg-gray-300"></div>
          <button onClick={() => navigate("/chats")} className="flex flex-col items-center gap-0.5">
            <img src="/icons/chat.png" alt="Чат" className="w-8 h-8" />
            <span className="text-[10px] text-gray-700">Чат</span>
          </button>
          <div className="w-px h-8 bg-gray-300"></div>
          <button onClick={() => navigate("/profile")} className="flex flex-col items-center gap-0.5">
            <img src="/icons/profile.png" alt="Профиль" className="w-8 h-8" />
            <span className="text-[10px] text-gray-700">Профиль</span>
          </button>
        </div>
      </div>
    </div>
  );
};