import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { deleteTrip as deleteTripRequest, getTrips } from "../../api/trips";
import { useAuthStore } from "../../stores/useAuthStore";
import type { Trip } from "../../types/trip";

export const TripsPage = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    getTrips()
      .then(setTrips)
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Не удалось загрузить поездки');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleTripClick = (tripId: number) => {
    navigate(`/trip/${tripId}/timeline`);
  };

  const deleteTrip = async (tripId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Вы действительно хотите удалить поездку?')) return;
    try {
      await deleteTripRequest(tripId);
      setTrips(prev => prev.filter(trip => trip.id !== tripId));
      toast.success('Поездка удалена');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Не удалось удалить поездку');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;

  // СТАРАЯ ВЁРСТКА (с фоном, бургером и иконками)
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
        {/* Бургер-меню и заголовок */}
        <div className="px-6 pt-6 pb-2 flex justify-between items-center">
          <button
            onClick={() => navigate("/quick-access")}
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
            Мои поездки
          </div>
          <div className="w-8"></div>
        </div>

        {/* Список поездок и кнопка добавления */}
        <div className="flex-1 px-6 py-4">
          <button
            onClick={() => navigate("/add-trip")}
            className="w-full bg-black/80 text-white font-semibold py-3 rounded-xl mb-6 hover:bg-black/90 transition backdrop-blur-sm"
          >
            + Добавить поездку
          </button>

          {trips.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-sm border border-gray/70 rounded-xl p-6 mb-6 shadow-md">
              <p className="text-center text-gray-800 font-medium">Пока нет ни одной поездки. Добавьте первую!</p>
            </div>
          ) : (
            trips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => handleTripClick(trip.id)}
                className="bg-gray-100/50 backdrop-blur-sm border border-gray-100 rounded-xl p-4 mb-6 cursor-pointer hover:bg-gray-100/50 transition"
              >
                <h2 className="font-bold text-lg mb-2">
                  {trip.status === 'active' ? 'Текущая поездка' : 'Завершенная поездка'}
                </h2>
                <p className="mb-1 text-black">🌍 {trip.title}</p>
                <p className="mb-1 text-black">
                  📅 {new Date(trip.startDate).toLocaleDateString()} — {new Date(trip.endDate).toLocaleDateString()}
                </p>
                <button
                  onClick={(e) => deleteTrip(trip.id, e)}
                  className="mt-2 text-red-600 hover:text-red-800 font-medium"
                >
                  🗑️ Удалить
                </button>
              </div>
            ))
          )}
        </div>

        {/* Кнопка "Архив поездок" (можно оставить или убрать) */}
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
            Архив поездок
          </button>
        </div>

        {/* Навигация внизу (иконки) */}
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
          <button onClick={() => navigate("/chat")} className="flex flex-col items-center gap-0.5">
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