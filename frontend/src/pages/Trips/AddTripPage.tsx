import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createTrip } from '../../api/trips';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { goToTimelineHome, setActiveTripId } from '../../utils/tripNavigation';

export const AddTripPage = () => {
  const navigate = useNavigate();
  // Состояния формы
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const trip = await createTrip({ title, startDate, endDate });
      setActiveTripId(trip.id);
      toast.success('Поездка создана');
      navigate(`/trip/${trip.id}/timeline`);
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
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Заголовок экрана с кнопкой назад */}
        <ScreenHeader
          title="Добавить поездку"
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

        {/* Контейнер формы */}
        <div className="flex flex-1 items-center justify-center px-4 py-4 sm:px-6">
          <div className="w-full max-w-md rounded-xl border border-white/30 bg-white/70 p-6 shadow-md backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Поле названия */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">Название поездки</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/50"
                  required
                  placeholder="Например, Тюмень — Санкт-Петербург"
                />
              </div>
              {/* Дата начала */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">Дата и время отправления</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/50"
                  required
                />
              </div>
              {/* Дата окончания */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">Дата и время прибытия</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/50"
                  required
                />
              </div>

              {/* Сообщение об ошибке */}
              {error && <p className="text-sm text-red-500">{error}</p>}

              {/* Кнопка создания */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-black/80 py-3 font-semibold text-white transition backdrop-blur-sm hover:bg-black/90 disabled:opacity-50"
              >
                {loading ? 'Сохранение...' : 'Создать поездку'}
              </button>
            </form>

            {/* Кнопка отмены/назад */}
            <button
              type="button"
              onClick={() => goToTimelineHome(navigate)}
              className="mt-4 w-full rounded-xl bg-gray-600/80 py-3 font-semibold text-white transition backdrop-blur-sm hover:bg-gray-700/80"
              style={{ backgroundColor: 'rgba(23, 26, 24, 0.77)' }}
            >
              ← Назад
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};