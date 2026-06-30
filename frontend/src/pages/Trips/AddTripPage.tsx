import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createTrip } from '../../api/trips';

export const AddTripPage = () => {
  const navigate = useNavigate();

  // Состояние для полей формы
  const [title, setTitle] = useState('');           // название поездки
  const [startDate, setStartDate] = useState('');   // дата и время отправления
  const [endDate, setEndDate] = useState('');       // дата и время прибытия
  const [loading, setLoading] = useState(false);    // флаг загрузки
  const [error, setError] = useState('');           // сообщение об ошибке

  // Отправляем данные на бэк при отправке формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // отменяем перезагрузку страницы

    setLoading(true);
    setError('');

    try {
      await createTrip({ title, startDate, endDate });
      toast.success('Поездка создана');
      navigate('/trips');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка создания поездки');
    } finally {
      setLoading(false);
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
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Верхняя панель */}
        <div className="bg-white/30 backdrop-blur-sm px-6 pt-6 pb-2 rounded-b-xl">
          <div className="flex justify-between items-center">
            <div className="w-8"></div>
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
              }}
            >
              Добавить поездку
            </div>
            <div className="w-8"></div>
          </div>
        </div>

        {/* Карточка с формой (полупрозрачная) */}
        <div className="flex-1 px-6 py-4 flex items-center justify-center">
          <div className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-6 shadow-md w-full max-w-md">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Название поездки</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/50 bg-white/80"
                  required
                  placeholder="Например, Тюмень — Санкт-Петербург"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Дата и время отправления</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/50 bg-white/80"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Дата и время прибытия</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/50 bg-white/80"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black/80 text-white font-semibold py-3 rounded-xl hover:bg-black/90 transition backdrop-blur-sm disabled:opacity-50"
              >
                {loading ? 'Сохранение...' : 'Создать поездку'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => navigate('/trips')}
              className="mt-4 w-full bg-gray-600/80 text-white font-semibold py-3 rounded-xl hover:bg-gray-700/80 transition backdrop-blur-sm"
              style={{
                backgroundColor: "rgba(23, 26, 24, 0.77)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "rgba(63, 68, 66, 0.6)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "rgba(23, 26, 24, 0.77)")
              }
            >
              ← Назад к поездкам
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};