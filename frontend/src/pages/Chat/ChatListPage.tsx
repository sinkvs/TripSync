import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChats } from '../../api/chat';

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
    sender: { name: string };   
    readBy: number[];  
  } | null;
}

export const ChatListPage = () => {
  const navigate = useNavigate();
  const currentUserId = Number(localStorage.getItem('userId')) || 0;
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
  // Асинхронная функция для загрузки чатов
  const fetchChats = async () => {
    try {
      setLoading(true);                       // Показываем индикатор загрузки
      setError('');                           // Сбрасываем предыдущую ошибку

      // 1. Получаем токен из localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        // Если токена нет – пользователь не авторизован, отправляем на логин
        navigate('/login');
        return;
      }

      // 2. Вызываем API-функцию для получения списка чатов
      const chatsData = await getChats(token);
      // 3. Сохраняем полученные чаты в состояние
      setChats(chatsData);
    } catch (err: any) {
      // 4. Обрабатываем ошибку
      console.error('Ошибка загрузки чатов:', err);
      setError('Не удалось загрузить чаты');

      // Если сервер вернул 401 (Unauthorized) – токен недействителен
      if (err.response?.status === 401) {
        localStorage.removeItem('token');    // Удаляем старый токен
        navigate('/login');                  // Отправляем на страницу входа
      }
    } finally {
      // 5. В любом случае снимаем флаг загрузки
      setLoading(false);
    }
  };

  // Вызываем функцию загрузки
  fetchChats();
}, [navigate]); // Зависимость – только navigate (она стабильна)

  // Форматирование времени
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  // Переход в чат конкретной поездки по её id
  const openChat = (tripId: number) => {
  console.log('Нажали на чат с tripId =', tripId);
  navigate(`/chat?tripId=${tripId}`);
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
          
            {/* Показываем сообщение об ошибке, если оно есть */}
            {error && <p className="text-red-500 text-center">{error}</p>}

          
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
                        {chat.lastMessage.readBy?.includes(currentUserId) ? '✓✓' : '✓'}
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
                    {chat.lastMessage.sender?.name}: {chat.lastMessage.content}
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