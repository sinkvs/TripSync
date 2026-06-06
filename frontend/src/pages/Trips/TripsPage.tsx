import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const TripsPage = () => {
  const navigate = useNavigate();

  // Проверяем авторизацию при загрузке страницы
  useEffect(() => {
    // Используем token
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Выходим из системы
  const handleLogout = () => {
    // Удаляем токен и rememberMe
    localStorage.removeItem("token");
    localStorage.removeItem("rememberMe");
    navigate("/login");
  };

  // Мок-данные для текущей поездки
  const currentTrip = {
    id: "1",
    city: "Тюмень-Москва",
    arrivalDate: "10.07.2026",
    
    
  };

      // Обработчик клика по поездке
  const handleTripClick = (tripId: string) => {
    navigate(`/trip/${tripId}/timeline`);
  };  

      // Мок-данные для прошлых поездок
  const pastTrips = [
    { id: "2", city: "Париж", date: "15-20 июня 2024" },
    { id: "3", city: "Лондон", date: "1-5 августа 2024" },
  ];


  return (
    // Этот div отвечает за фон
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/images/trips.jpg')", // путь к картинке
        backgroundSize: "cover", // растянуть на весь экран
        backgroundPosition: "center", // по центру
        backgroundRepeat: "no-repeat", // не повторять
      }}
    >

      {/* Основной контент (поверх фона)*/}
        <div className="relative z-10 flex flex-col min-h-screen">
          
          {/* Кнопка бургер-меню слева */}
          <button
            onClick={() => navigate("/quick-access")}
            className="text-black text-2xl"
          >
            ☰
          </button>
          
            <h1 
            className="text-white font-bold text-center"
            style={{ 
              fontSize: "24px", 
              lineHeight: "32px",
              textShadow: "2px 2px 0 black, -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black"
            }}
          >
            Мои поездки
          </h1>

           <div className="w-8"></div>
        

           {/* Блок с текущей поездкой и кнопкой добавления */}
          <div className="flex-1 px-6 py-4">
          
          {/* Кнопка "Добавить поездку" */}
          <button
            onClick={() => navigate("/add-trip")}
            className="w-full bg-black/80 text-white font-semibold py-3 rounded-xl mb-6 hover:bg-black/90 transition backdrop-blur-sm"
          >
            + Добавить поездку
          </button>

          {/* Блок текущей поездки */}
          {currentTrip ? (
            <div className="bg-white/90 backdrop-blur-sm border-2 border-black rounded-xl p-4 mb-6">
              <h2 className="font-bold text-lg mb-2">Текущая поездка</h2>
              <p className="mb-1">  {currentTrip.city}</p>
              <p className="mb-1">
                📅 {currentTrip.arrivalDate} 
              </p>
            </div>
          ) : null} 
             </div>

          {/* Прозрачная серая кнопка "Архив поездок" */}
          <div className="px-6 mb-4">
            <button
              onClick={() => navigate("/archive")}
              className="w-full bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition"
              style={{
              height: "52px",
              fontSize: "16px",
              borderRadius: "12px",
              backgroundColor: "rgba(23, 26, 24, 0.77)",
          }}
              onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(63, 68, 66, 0.6)")
          }
              onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(23, 26, 24, 0.77)")
          }
        >
              📦 Архив поездок
            </button>
          </div>

          {/* Кнопки навигации */}
          <div className="py-4 px-6 flex justify-around items-center">
            <button onClick={() => navigate("/weather")}>
              <img src="/icons/weather.png" alt="Погода" className="w-6 h-6" />
            </button>
            <button onClick={() => navigate("/map")}>
              <img src="/icons/map.png" alt="Карта" className="w-6 h-6" />
            </button>
            <button onClick={() => navigate("/chat")}>
              <img src="/icons/chat.png" alt="Чат" className="w-6 h-6" />
            </button>
            <button onClick={() => navigate("/profile")}>
              <img src="/icons/profile.png" alt="Профиль" className="w-6 h-6" />
            </button>
          </div>
      </div>
    </div>
  );
};