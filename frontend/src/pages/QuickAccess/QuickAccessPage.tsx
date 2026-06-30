import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getDocumentsByTrip } from '../../api/documents';
import { getEvents, getTrips } from '../../api/trips';
import { DocumentList } from '../../components/Documents/DocumentList';
import { DocumentUploader } from '../../components/Documents/DocumentUploader';
import type { TimelineEvent, Trip, TripDocument } from '../../types/trip';

export const QuickAccessPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [documents, setDocuments] = useState<TripDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);

  const tripId = Number(searchParams.get('tripId') || 0);

  useEffect(() => {
    getTrips()
      .then((items) => {
        setTrips(items);
        if (!tripId && items[0]) {
          setSearchParams({ tripId: String(items[0].id) });
        }
      })
      .catch(() => setTrips([]));
  }, [tripId, setSearchParams]);

  useEffect(() => {
    if (!tripId) return;
    setLoading(true);
    Promise.all([getDocumentsByTrip(tripId), getEvents(tripId)])
      .then(([docs, tripEvents]) => {
        setDocuments(docs);
        setEvents(tripEvents);
      })
      .finally(() => setLoading(false));
  }, [tripId]);

  const grouped = useMemo(
    () => ({
      flight: documents.filter((item) => item.category === 'flight'),
      hotel: documents.filter((item) => item.category === 'hotel'),
      event: documents.filter((item) => item.category === 'event'),
    }),
    [documents]
  );

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
            <button
              onClick={() => navigate('/trips')}
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
              ←
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
              }}
            >
              Документы
            </div>
            <div className="w-8"></div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="flex-1 px-6 py-4 overflow-y-auto pb-32">
          {/* Выбор поездки */}
          <div className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-4 mb-6 shadow-md">
            <div className="mb-2 text-sm font-medium text-gray-800">Выберите поездку</div>
            <select
              value={tripId || ''}
              onChange={(event) => setSearchParams({ tripId: event.target.value })}
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 bg-white/80"
            >
              <option value="">Выберите поездку</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.title}
                </option>
              ))}
            </select>
          </div>

          {tripId ? (
            <>
              {/* Кнопка показа/скрытия формы */}
              <button
                onClick={() => setShowUploader(!showUploader)}
                className="w-full bg-black/80 text-white font-semibold py-3 rounded-xl mb-6 hover:bg-black/90 transition backdrop-blur-sm"
              >
                {showUploader ? '− Скрыть форму' : '+ Добавить документ'}
              </button>

              {/* Форма загрузки (условно) */}
              {showUploader && (
                <div className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-4 mb-6 shadow-md">
                  <DocumentUploader
                    tripId={tripId}
                    events={events}
                    onUploaded={(document) => {
                      setDocuments((current) => [document, ...current]);
                      setShowUploader(false);
                    }}
                  />
                </div>
              )}

              {/* Список документов всегда виден */}
              {loading ? (
                <div className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-6 text-center">
                  <p className="text-gray-800 font-medium">Загрузка документов...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-4 shadow-md">
                    <DocumentList title="Трансфер" documents={grouped.flight} onDeleted={(id) => setDocuments((items) => items.filter((item) => item.id !== id))} />
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-4 shadow-md">
                    <DocumentList title="Проживание" documents={grouped.hotel} onDeleted={(id) => setDocuments((items) => items.filter((item) => item.id !== id))} />
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-4 shadow-md">
                    <DocumentList title="События" documents={grouped.event} onDeleted={(id) => setDocuments((items) => items.filter((item) => item.id !== id))} />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-6 text-center">
              <p className="text-gray-800 font-medium">Сначала выберите поездку.</p>
            </div>
          )}
        </div>

        {/* Фиксированная навигация */}
        <div className="fixed bottom-4 left-0 right-0 z-20 flex justify-center pointer-events-none">
          <div className="pointer-events-auto w-full max-w-[430px] px-4">
            <div className="py-4 px-6 flex justify-around items-center bg-white/60 backdrop-blur-sm border border-white/20 rounded-full shadow-sm">
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
      </div>
    </div>
  );
};