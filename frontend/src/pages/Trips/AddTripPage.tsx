import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createTrip } from '../../api/trips';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { goToTimelineHome, setActiveTripId } from '../../utils/tripNavigation';

// Помечает строку из datetime-local как UTC без преобразования времени
const toLiteralUTCString = (dateStr: string): string => {
  if (!dateStr) return dateStr;
  const hasSeconds = dateStr.length > 16; // "YYYY-MM-DDTHH:mm" vs "YYYY-MM-DDTHH:mm:ss"
  return hasSeconds ? `${dateStr}.000Z` : `${dateStr}:00.000Z`;
};

export const AddTripPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Новые состояния для трансфера
  const [addTransfer, setAddTransfer] = useState(false);
  const [transferType, setTransferType] = useState('flight');
  const [transferStart, setTransferStart] = useState('');
  const [transferEnd, setTransferEnd] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Формируем тело запроса
      const tripData: any = {
        title,
        startDate: toLiteralUTCString(startDate),
      };
      
      // Дата окончания теперь необязательна
      if (endDate) {
        tripData.endDate = toLiteralUTCString(endDate);
      }

      // Добавляем трансфер если выбран
      if (addTransfer && transferStart) {
        tripData.transfer = {
          type: transferType,
          startDateTime: toLiteralUTCString(transferStart),
          endDateTime: transferEnd ? toLiteralUTCString(transferEnd) : undefined,
        };
      }

      const trip = await createTrip(tripData);
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
    <div className="min-h-screen flex flex-col" style={{ backgroundImage: "url('/images/trips.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="relative z-10 flex min-h-screen flex-col">
        <ScreenHeader title="Добавить поездку" left={
          <button type="button" onClick={() => goToTimelineHome(navigate)} className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black text-2xl text-black">←</button>
        } />
        
        <div className="flex flex-1 items-center justify-center px-4 py-4 sm:px-6">
          <div className="w-full max-w-md rounded-xl border border-white/30 bg-white/70 p-6 shadow-md backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Название */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">Название поездки</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/50" required placeholder="Например, Тюмень — Санкт-Петербург" />
              </div>
              
              {/* Дата начала */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">Дата начала путешествия</label>
                <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/50" required />
              </div>
              
              {/* Дата окончания (необязательно) */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">Дата окончания <span className="text-gray-500 font-normal">(необязательно)</span></label>
                <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/50" />
              </div>

              {/* Разделитель и чекбокс трансфера */}
              <div className="border-t border-gray-300 my-4"></div>
              <div className="flex items-center">
                <input type="checkbox" id="addTransfer" checked={addTransfer} onChange={(e) => setAddTransfer(e.target.checked)} className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black" />
                <label htmlFor="addTransfer" className="ml-2 text-sm font-medium text-gray-800">Добавить трансфер сейчас?</label>
              </div>

              {/* Поля трансфера */}
              {addTransfer && (
                <div className="space-y-3 pl-4 border-l-2 border-gray-300">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800">Тип транспорта</label>
                    <select value={transferType} onChange={(e) => setTransferType(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white/80 px-3 py-2">
                      <option value="flight">✈️ Перелёт</option>
                      <option value="train">🚆 Поезд</option>
                      <option value="car">🚗 Машина</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800">Время отправления</label>
                    <input type="datetime-local" value={transferStart} onChange={(e) => setTransferStart(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white/80 px-3 py-2" required />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800">Время прибытия <span className="text-gray-500 font-normal">(необязательно)</span></label>
                    <input type="datetime-local" value={transferEnd} onChange={(e) => setTransferEnd(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white/80 px-3 py-2" />
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}
              
              <button type="submit" disabled={loading} className="w-full rounded-xl bg-black/80 py-3 font-semibold text-white transition backdrop-blur-sm hover:bg-black/90 disabled:opacity-50">
                {loading ? 'Сохранение...' : 'Создать поездку'}
              </button>
            </form>
            
            <button type="button" onClick={() => goToTimelineHome(navigate)} className="mt-4 w-full rounded-xl bg-gray-600/80 py-3 font-semibold text-white transition backdrop-blur-sm hover:bg-gray-700/80" style={{ backgroundColor: 'rgba(23, 26, 24, 0.77)' }}>
              ← Назад
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};