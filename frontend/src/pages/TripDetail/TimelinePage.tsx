import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createInvitation } from '../../api/invitation';
import { createEvent, deleteEvent, getEvents, getTrip, updateEvent } from '../../api/trips';
import { BottomNav } from '../../components/layout/BottomNav';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import type { TimelineEvent, Trip } from '../../types/trip';
import { setActiveTripId } from '../../utils/tripNavigation';

// Форма создания/редактирования события
type EventForm = {
  type: string;
  title: string;
  startDateTime: string;
  endDateTime: string;
  locationCoords: string;
};

// Пустая форма по умолчанию
const emptyForm: EventForm = {
  type: 'flight',
  title: '',
  startDateTime: '',
  endDateTime: '',
  locationCoords: '',
};

export const TimelinePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tripId = Number(id);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteLink, setInviteLink] = useState('');
  const [showCopyButton, setShowCopyButton] = useState(false);

  // Состояния редактирования события
  const [editEvent, setEditEvent] = useState<TimelineEvent | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState('flight');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editCoords, setEditCoords] = useState('');

  // Загрузка таймлайна поездки
  const loadTimeline = () => {
    if (!tripId) return;

    setLoading(true);
    Promise.all([getTrip(tripId), getEvents(tripId)])
      .then(([tripResponse, eventsResponse]) => {
        setTrip(tripResponse);
        setEvents(eventsResponse);
      })
      .catch(() => toast.error('Не удалось загрузить таймлайн'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (tripId) {
      setActiveTripId(tripId);
    }

    loadTimeline();
  }, [tripId]);

  // Создание или обновление события
  const submitEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const updated = await updateEvent(editingId, {
          ...form,
          endDateTime: form.endDateTime || undefined,
          locationCoords: form.locationCoords || undefined,
        });
        setEvents((prev) => prev.map((event) => (event.id === editingId ? updated : event)));
        toast.success('Обновлено');
      } else {
        const created = await createEvent(tripId, {
          ...form,
          endDateTime: form.endDateTime || undefined,
          locationCoords: form.locationCoords || undefined,
        });
        setEvents((prev) =>
          [...prev, created].sort((a, b) => a.startDateTime.localeCompare(b.startDateTime))
        );
        toast.success('Добавлено');
      }

      setForm(emptyForm);
      setEditingId(null);
      document.getElementById('addEventForm')?.classList.add('hidden');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ошибка');
    }
  };

  // Начало редактирования события
  const startEdit = (event: TimelineEvent) => {
    setEditEvent(event);
    setEditingId(event.id);
    setEditTitle(event.title);
    setEditType(event.type);
    setEditStart(event.startDateTime.slice(0, 16));
    setEditEnd(event.endDateTime?.slice(0, 16) || '');
    setEditCoords(event.locationCoords || '');
  };

  // Отправка формы редактирования
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEvent) return;

    try {
      const updated = await updateEvent(editEvent.id, {
        type: editType,
        title: editTitle,
        startDateTime: editStart,
        endDateTime: editEnd || undefined,
        locationCoords: editCoords || undefined,
      });

      setEvents((prev) => prev.map((event) => (event.id === editEvent.id ? updated : event)));
      setEditEvent(null);
      setEditingId(null);
      toast.success('Обновлено');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ошибка');
    }
  };

  // Удаление события
  const removeEvent = async (eventId: number) => {
    if (!window.confirm('Удалить событие?')) return;

    try {
      await deleteEvent(eventId);
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      toast.success('Удалено');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ошибка');
    }
  };

  // Создание приглашения
  const handleInvite = async () => {
    try {
      const link = await createInvitation(tripId);
      setInviteLink(link);
      setShowCopyButton(true);
      toast.success('Приглашение создано');
    } catch {
      toast.error('Не удалось создать приглашение');
    }
  };

  // Резервный метод копирования через textarea
  const fallbackCopy = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
      toast.success('Ссылка скопирована в буфер обмена');
    } catch {
      toast.error('Не удалось скопировать ссылку');
    }
    document.body.removeChild(textarea);
  };

  // Копирование ссылки в буфер обмена
  const copyLink = () => {
    // Попытка через современный Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(inviteLink).then(() => {
        toast.success('Ссылка скопирована в буфер обмена');
      }).catch(() => {
        fallbackCopy(inviteLink);
      });
    } else {
      // Fallback для HTTP и IP-адресов
      fallbackCopy(inviteLink);
    }
    setShowCopyButton(false);
    setInviteLink('');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;

  // Сортировка и группировка событий по датам
  const orderedEvents = [...events].sort((a, b) => a.startDateTime.localeCompare(b.startDateTime));
  const grouped: Record<string, TimelineEvent[]> = {};

  orderedEvents.forEach((event) => {
    const date = new Date(event.startDateTime).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(event);
  });

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const today = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const nextEvent = orderedEvents[0] ?? null;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/images/trips.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Шапка с заголовком и кнопкой приглашения */}
        <ScreenHeader
          title={trip?.title ? `Таймлайн: ${trip.title}` : 'Таймлайн'}
          left={
            <button
              type="button"
              onClick={() => navigate(`/quick-access?tripId=${tripId}`)}
              className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black text-2xl text-black"
            >
              ☰
            </button>
          }
          right={
            <button
              type="button"
              onClick={handleInvite}
              className="rounded-xl bg-black px-3 py-2 text-sm font-bold text-white"
            >
              Пригласить
            </button>
          }
          rightWide
        />

        {/* Блок ближайшего события */}
        <div className="mx-4 mt-4 rounded-xl border border-white/30 bg-white/70 p-4 shadow-md backdrop-blur-sm sm:mx-6">
          <h2 className="text-lg font-bold text-gray-800">Сегодня, {today}</h2>
          {nextEvent ? (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Ближайшее:</p>
              <p className="break-words font-medium text-black">
                {nextEvent.title} —{' '}
                {new Date(nextEvent.startDateTime).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-gray-500">Нет событий</p>
          )}
        </div>

        {/* Кнопка копирования ссылки */}
        {showCopyButton && (
          <div className="mx-4 mb-4 mt-4 sm:mx-6">
            <button
              onClick={copyLink}
              className="w-full rounded-xl bg-black/80 py-2 font-semibold text-white transition backdrop-blur-sm hover:bg-black/90"
            >
              Скопировать ссылку для приглашения
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 sm:px-6">
          {orderedEvents.length === 0 ? (
            <div className="rounded-xl border border-white/30 bg-white/70 p-6 text-center backdrop-blur-sm">
              <p className="font-medium text-gray-800">Пока нет событий</p>
            </div>
          ) : (
            // Список событий по датам
            sortedDates.map((date) => (
              <div key={date} className="mb-6">
                <h3 className="mb-3 inline-block rounded-full bg-black/50 px-3 py-1 text-lg font-semibold text-white backdrop-blur-sm">
                  {date === today ? 'Сегодня' : date}
                </h3>

                {grouped[date].map((event) => (
                  <div
                    key={event.id}
                    className="mb-3 rounded-xl border border-white/30 bg-white/70 p-4 shadow-md backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {event.type === 'flight' ? '✈️' : event.type === 'hotel' ? '🏨' : '🎉'}
                          </span>
                          <p className="break-words font-bold text-black">{event.title}</p>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(event.startDateTime).toLocaleString()}
                        </p>
                        {event.locationCoords && (
                          <p className="break-all text-sm text-gray-500">📍 {event.locationCoords}</p>
                        )}
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button onClick={() => startEdit(event)} className="text-blue-600">
                          ✏️
                        </button>
                        <button onClick={() => removeEvent(event.id)} className="text-red-600">
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}

          {/* Кнопка добавления события */}
          <button
            onClick={() => document.getElementById('addEventForm')?.classList.toggle('hidden')}
            className="mb-6 w-full rounded-xl bg-black/80 py-3 font-semibold text-white"
          >
            + Добавить событие
          </button>

          {/* Форма создания/редактирования события */}
          <div
            id="addEventForm"
            className="hidden mb-6 rounded-xl border border-white/30 bg-white/70 p-4 shadow-md backdrop-blur-sm"
          >
            <h3 className="mb-3 text-lg font-bold">{editingId ? 'Редактировать' : 'Новое событие'}</h3>
            <form onSubmit={submitEvent} className="space-y-3">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-lg border bg-white/80 px-3 py-2"
              >
                <option value="flight">Перелёт</option>
                <option value="hotel">Отель</option>
                <option value="event">Событие</option>
              </select>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Название"
                className="w-full rounded-lg border bg-white/80 px-3 py-2"
                required
              />
              <input
                type="datetime-local"
                value={form.startDateTime}
                onChange={(e) => setForm({ ...form, startDateTime: e.target.value })}
                className="w-full rounded-lg border bg-white/80 px-3 py-2"
                required
              />
              {form.type === 'flight' && (
                <input
                  type="datetime-local"
                  value={form.endDateTime}
                  onChange={(e) => setForm({ ...form, endDateTime: e.target.value })}
                  className="w-full rounded-lg border bg-white/80 px-3 py-2"
                />
              )}
              <input
                type="text"
                value={form.locationCoords}
                onChange={(e) => setForm({ ...form, locationCoords: e.target.value })}
                placeholder="Координаты"
                className="w-full rounded-lg border bg-white/80 px-3 py-2"
              />
              <button type="submit" className="w-full rounded-lg bg-black py-2 font-semibold text-white">
                {editingId ? 'Сохранить' : 'Добавить'}
              </button>
            </form>
          </div>

          {/* Модальное окно редактирования */}
          {editEvent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="w-[min(24rem,calc(100vw-2rem))] rounded-xl bg-white p-6">
                <h3 className="mb-3 text-lg font-bold">Редактировать</h3>
                <form onSubmit={handleEditSubmit} className="space-y-3">
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2"
                  >
                    <option value="flight">Перелёт</option>
                    <option value="hotel">Отель</option>
                    <option value="event">Событие</option>
                  </select>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Название"
                    className="w-full rounded-lg border px-3 py-2"
                    required
                  />
                  <input
                    type="datetime-local"
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2"
                    required
                  />
                  {editType === 'flight' && (
                    <input
                      type="datetime-local"
                      value={editEnd}
                      onChange={(e) => setEditEnd(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2"
                    />
                  )}
                  <input
                    type="text"
                    value={editCoords}
                    onChange={(e) => setEditCoords(e.target.value)}
                    placeholder="Координаты"
                    className="w-full rounded-lg border px-3 py-2"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 rounded-lg bg-black py-2 font-semibold text-white"
                    >
                      Сохранить
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditEvent(null);
                        setEditingId(null);
                      }}
                      className="flex-1 rounded-lg bg-gray-300 py-2 font-semibold"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/trips')}
            className="mt-4 w-full rounded-xl bg-gray-600/80 py-3 font-semibold text-white"
            style={{ backgroundColor: 'rgba(23, 26, 24, 0.77)' }}
          >
            ← Назад к поездкам
          </button>
        </div>

        <BottomNav />
      </div>
    </div>
  );
};