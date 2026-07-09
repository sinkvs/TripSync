import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getDocumentsByTrip } from '../../api/documents';
import { getEvents, getTrips } from '../../api/trips';
import { DocumentList } from '../../components/Documents/DocumentList';
import { DocumentUploader } from '../../components/Documents/DocumentUploader';
import { BottomNav } from '../../components/layout/BottomNav';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import type { TimelineEvent, Trip, TripDocument } from '../../types/trip';
import { goToTimelineHome, setActiveTripId } from '../../utils/tripNavigation';

export const QuickAccessPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [documents, setDocuments] = useState<TripDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);

  // ID поездки из URL
  const tripId = Number(searchParams.get('tripId') || 0);

  useEffect(() => {
    getTrips()
      .then((items) => {
        setTrips(items);
        if (!tripId && items[0]) {
          // Установка первой поездки по умолчанию
          setSearchParams({ tripId: String(items[0].id) });
        }
      })
      .catch(() => setTrips([]));
  }, [tripId, setSearchParams]);

  useEffect(() => {
    if (!tripId) return;
    setActiveTripId(tripId);
    setLoading(true);
    // Загрузка документов и событий
    Promise.all([getDocumentsByTrip(tripId), getEvents(tripId)])
      .then(([docs, tripEvents]) => {
        setDocuments(docs);
        setEvents(tripEvents);
      })
      .finally(() => setLoading(false));
  }, [tripId]);

  // Группировка документов по категориям
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
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="relative z-10 flex min-h-screen flex-col">
        <ScreenHeader
          title="Документы"
          left={
            <button
              type="button"
              onClick={() => goToTimelineHome(navigate, tripId || undefined)}
              className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black text-2xl text-black"
            >
              ←
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 sm:px-6">
          {/* Блок выбора поездки */}
          <div className="mb-6 rounded-xl border border-white/30 bg-white/70 p-4 shadow-md backdrop-blur-sm">
            <div className="mb-2 text-sm font-medium text-gray-800">Выберите поездку</div>
            <select
              value={tripId || ''}
              onChange={(event) => setSearchParams({ tripId: event.target.value })}
              className="w-full rounded-2xl border border-stone-200 bg-white/80 px-4 py-3"
            >
              <option value="">Выберите поездку</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.title}
                </option>
              ))}
            </select>

            {tripId ? (
              <button
                type="button"
                onClick={() => goToTimelineHome(navigate, tripId)}
                className="mt-3 w-full rounded-xl bg-black/80 px-4 py-3 font-semibold text-white transition hover:bg-black/90"
              >
                 Главная
              </button>
            ) : null}
          </div>

          {tripId ? (
            <>
              {/* Кнопка показа формы загрузки */}
              <button
                onClick={() => setShowUploader(!showUploader)}
                className="mb-6 w-full rounded-xl bg-black/80 py-3 font-semibold text-white transition backdrop-blur-sm hover:bg-black/90"
              >
                {showUploader ? '− Скрыть форму' : '+ Добавить документ'}
              </button>

              {/* Форма загрузки документов */}
              {showUploader && (
                <div className="mb-6 rounded-xl border border-white/30 bg-white/70 p-4 shadow-md backdrop-blur-sm">
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

              {loading ? (
                // Индикатор загрузки
                <div className="rounded-xl border border-white/30 bg-white/70 p-6 text-center backdrop-blur-sm">
                  <p className="font-medium text-gray-800">Загрузка документов...</p>
                </div>
              ) : (
                // Списки документов по категориям
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/30 bg-white/70 p-4 shadow-md backdrop-blur-sm">
                    <DocumentList
                      title="Трансфер"
                      documents={grouped.flight}
                      onDeleted={(id) =>
                        setDocuments((items) => items.filter((item) => item.id !== id))
                      }
                    />
                  </div>
                  <div className="rounded-xl border border-white/30 bg-white/70 p-4 shadow-md backdrop-blur-sm">
                    <DocumentList
                      title="Проживание"
                      documents={grouped.hotel}
                      onDeleted={(id) =>
                        setDocuments((items) => items.filter((item) => item.id !== id))
                      }
                    />
                  </div>
                  <div className="rounded-xl border border-white/30 bg-white/70 p-4 shadow-md backdrop-blur-sm">
                    <DocumentList
                      title="События"
                      documents={grouped.event}
                      onDeleted={(id) =>
                        setDocuments((items) => items.filter((item) => item.id !== id))
                      }
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            // Заглушка при отсутствии выбранной поездки
            <div className="rounded-xl border border-white/30 bg-white/70 p-6 text-center backdrop-blur-sm">
              <p className="font-medium text-gray-800">Сначала выберите поездку.</p>
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  );
};