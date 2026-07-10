import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createInvitation } from '../../api/invitation';
import { createEvent, deleteEvent, getEvents, getTrip, updateEvent, removeMember } from '../../api/trips';
import { BottomNav } from '../../components/layout/BottomNav';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import type { TimelineEvent, Trip } from '../../types/trip';
import { setActiveTripId } from '../../utils/tripNavigation';
import { useAuthStore } from '../../stores/useAuthStore';

type EventForm = {
  type: string;
  title: string;
  startDateTime: string;
  endDateTime: string;
  locationCoords: string;
};

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
  const { user } = useAuthStore();
  const currentUserId = user?.id;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [inviteLink, setInviteLink] = useState('');
  const [showCopyButton, setShowCopyButton] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const [editEvent, setEditEvent] = useState<TimelineEvent | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState('flight');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editCoords, setEditCoords] = useState('');

  const formRef = useRef<HTMLDivElement>(null);

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
      // Прокрутка вверх после сохранения
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ошибка');
    }
  };

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

  const startEdit = (event: TimelineEvent) => {
    setEditEvent(event);
    setEditingId(event.id);
    setEditTitle(event.title);
    setEditType(event.type);
    setEditStart(event.startDateTime.slice(0, 16));
    setEditEnd(event.endDateTime?.slice(0, 16) || '');
    setEditCoords(event.locationCoords || '');
  };

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
      // Прокрутка вверх после редактирования
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleRemoveMember = async (memberUserId: number) => {
    if (!window.confirm('Удалить этого участника из поездки?')) return;
    try {
      await removeMember(tripId, memberUserId);
      toast.success('Участник удалён');
      if (trip) {
        setTrip({
          ...trip,
          members: trip.members.filter((m) => m.user.id !== memberUserId),
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ошибка удаления');
    }
  };

  const handleInvite = async () => {
    try {
      const link = await createInvitation(tripId);
      setInviteLink(link);
      setShowCopyButton(true);
      toast.success('Ссылка создана');
    } catch {
      toast.error('Не удалось создать приглашение');
    }
  };

  const copyLink = async () => {
    if (!inviteLink) {
      toast.error('Ссылка не создана');
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(inviteLink);
        toast.success('Ссылка скопирована!');
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = inviteLink;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
          document.execCommand('copy');
          toast.success('Ссылка скопирована!');
        } catch (err) {
          toast.error('Не удалось скопировать');
        }
        
        document.body.removeChild(textArea);
      }
      
      setShowCopyButton(false);
      setInviteLink('');
    } catch (err) {
      console.error('Ошибка копирования:', err);
      toast.error('Не удалось скопировать ссылку');
    }
  };

  const toggleEventForm = () => {
    const form = document.getElementById('addEventForm');
    if (form) {
      const isHidden = form.classList.contains('hidden');
      form.classList.toggle('hidden');
      if (!isHidden) {
        // Форма была видна, теперь закрываем – вверх
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Форма открывается – прокручиваем к ней
        setTimeout(() => {
          form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;

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
        />

        <div className="mx-4 mt-4 rounded-xl border border-white/30 bg-white/70 p-4 shadow-md backdrop-blur-sm sm:mx-6">
          <h2 className="text-lg font-bold text-gray-800">Сегодня, {today}</h2>
          {nextEvent ? (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Ближайшее событие:</p>
              <p className="break-words font-medium text-black">
                {nextEvent.title} —{' '}
                {new Date(nextEvent.startDateTime).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-gray-500">Нет предстоящих событий</p>
          )}
        </div>

        {trip && currentUserId === trip.userId && trip.members && trip.members.length > 0 && (
          <div className="mx-4 mt-4 rounded-xl border border-white/30 bg-white/70 p-4 shadow-md backdrop-blur-sm sm:mx-6">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setShowMembers(!showMembers)}
            >
              <h3 className="text-md font-semibold text-gray-800">Участники ({trip.members.length})</h3>
              <span className="text-sm text-gray-500">{showMembers ? '▲' : '▼'}</span>
            </div>
            {showMembers && (
              <div className="space-y-2 mt-2">
                {trip.members.map((member) => (
                  <div key={member.user.id} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">
                      {member.user.name} {member.role === 'OWNER' && '👑'}
                    </span>
                    {member.role !== 'OWNER' && (
                      <button
                        onClick={() => handleRemoveMember(member.user.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Исключить
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mx-4 mt-4 sm:mx-6">
          <button
            onClick={handleInvite}
            className="w-full rounded-xl bg-black/80 py-3 font-semibold text-white transition backdrop-blur-sm hover:bg-black/90 shadow-md"
          >
            🤝 Пригласить друга в поездку
          </button>
        </div>

        {showCopyButton && (
          <div className="mx-4 mb-4 mt-4 sm:mx-6">
            <button
              onClick={copyLink}
              className="w-full rounded-xl bg-green-600/90 py-3 font-semibold text-white transition backdrop-blur-sm hover:bg-green-700 shadow-lg"
            >
              📋 Скопировать ссылку для друга
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 sm:px-6">
          {orderedEvents.length === 0 ? (
            <div className="rounded-xl border border-white/30 bg-white/70 p-6 text-center backdrop-blur-sm">
              <p className="font-medium text-gray-800">Пока нет событий. Добавьте первое!</p>
            </div>
          ) : (
            sortedDates.map((date) => (
              <div key={date} className="mb-6">
                <h3 className="mb-3 inline-block rounded-full bg-black/50 px-3 py-1 text-lg font-semibold text-white backdrop-blur-sm">
                  {date === today ? 'Сегодня' : date}
                </h3>
                <div className="space-y-3">
                  {grouped[date].map((event) => (
                    <div
                      key={event.id}
                      className="rounded-xl border border-white/30 bg-white/70 p-4 shadow-md backdrop-blur-sm"
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
                            {event.type === 'flight' ? (
                              <>
                                Отправление: {new Date(event.startDateTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                {event.endDateTime && (
                                  <> → Прибытие: {new Date(event.endDateTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</>
                                )}
                              </>
                            ) : (
                              <>Время: {new Date(event.startDateTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</>
                            )}
                          </p>
                          {event.locationCoords && (
                            <p className="break-all text-sm text-gray-500">📍 {event.locationCoords}</p>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button onClick={() => startEdit(event)} className="text-blue-600 p-1">
                            ✏️
                          </button>
                          <button onClick={() => removeEvent(event.id)} className="text-red-600 p-1">
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          <button
            onClick={toggleEventForm}
            className="mb-6 w-full rounded-xl bg-black/80 py-3 font-semibold text-white hover:bg-black/90 transition"
          >
            + Добавить событие
          </button>

          <div
            id="addEventForm"
            ref={formRef}
            className="hidden mb-6 rounded-xl border border-white/30 bg-white/70 p-4 shadow-md backdrop-blur-sm"
          >
            <h3 className="mb-3 text-lg font-bold">{editingId ? 'Редактировать' : 'Новое событие'}</h3>
            <form onSubmit={submitEvent} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-800">Тип</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-lg border bg-white/80 px-3 py-2"
                >
                  <option value="flight">Перелёт</option>
                  <option value="hotel">Отель</option>
                  <option value="event">Событие</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800">Название</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Например, Перелёт Москва-Сочи"
                  className="w-full rounded-lg border bg-white/80 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800">Дата и время</label>
                <input
                  type="datetime-local"
                  value={form.startDateTime}
                  onChange={(e) => setForm({ ...form, startDateTime: e.target.value })}
                  className="w-full rounded-lg border bg-white/80 px-3 py-2"
                  required
                />
              </div>
              {form.type === 'flight' && (
                <div>
                  <label className="block text-sm font-medium text-gray-800">Время прибытия</label>
                  <input
                    type="datetime-local"
                    value={form.endDateTime}
                    onChange={(e) => setForm({ ...form, endDateTime: e.target.value })}
                    className="w-full rounded-lg border bg-white/80 px-3 py-2"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-800">Координаты</label>
                <input
                  type="text"
                  value={form.locationCoords}
                  onChange={(e) => setForm({ ...form, locationCoords: e.target.value })}
                  placeholder="Координаты"
                  className="w-full rounded-lg border bg-white/80 px-3 py-2"
                />
              </div>
              <button type="submit" className="w-full rounded-lg bg-black py-2 font-semibold text-white hover:bg-gray-800">
                {editingId ? 'Сохранить' : 'Добавить'}
              </button>
            </form>
          </div>

          {editEvent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                <h3 className="mb-3 text-lg font-bold">Редактировать событие</h3>
                <form onSubmit={handleEditSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium">Тип</label>
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2"
                    >
                      <option value="flight">Перелёт</option>
                      <option value="hotel">Отель</option>
                      <option value="event">Событие</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Название</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Дата и время</label>
                    <input
                      type="datetime-local"
                      value={editStart}
                      onChange={(e) => setEditStart(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2"
                      required
                    />
                  </div>
                  {editType === 'flight' && (
                    <div>
                      <label className="block text-sm font-medium">Время прибытия</label>
                      <input
                        type="datetime-local"
                        value={editEnd}
                        onChange={(e) => setEditEnd(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium">Координаты</label>
                    <input
                      type="text"
                      value={editCoords}
                      onChange={(e) => setEditCoords(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 rounded-lg bg-black py-2 font-semibold text-white hover:bg-gray-800"
                    >
                      Сохранить
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditEvent(null);
                        setEditingId(null);
                        // Прокрутка вверх при закрытии модалки
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex-1 rounded-lg bg-gray-300 py-2 font-semibold text-gray-800 hover:bg-gray-400"
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
            className="mt-4 w-full rounded-xl bg-gray-600/80 py-3 font-semibold text-white hover:bg-gray-700/80 transition backdrop-blur-sm"
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