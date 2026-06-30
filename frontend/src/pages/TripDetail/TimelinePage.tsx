import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createEvent, deleteEvent, getEvents, getTrip, updateEvent } from '../../api/trips';
import { createInvitation } from '../../api/invitation';
import type { TimelineEvent, Trip } from '../../types/trip';

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
  const [trip, setTrip] = useState<Trip | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteLink, setInviteLink] = useState('');
  const [showCopyButton, setShowCopyButton] = useState(false);

  const [editEvent, setEditEvent] = useState<TimelineEvent | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState('flight');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editCoords, setEditCoords] = useState('');

  const loadTimeline = () => {
    if (!tripId) return;
    setLoading(true);
    Promise.all([getTrip(tripId), getEvents(tripId)])
      .then(([t, e]) => { setTrip(t); setEvents(e); })
      .catch(() => toast.error('Не удалось загрузить таймлайн'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTimeline(); }, [tripId]);

  const submitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updated = await updateEvent(editingId, {
          ...form,
          endDateTime: form.endDateTime || undefined,
          locationCoords: form.locationCoords || undefined,
        });
        setEvents(prev => prev.map(ev => ev.id === editingId ? updated : ev));
        toast.success('Обновлено');
      } else {
        const created = await createEvent(tripId, {
          ...form,
          endDateTime: form.endDateTime || undefined,
          locationCoords: form.locationCoords || undefined,
        });
        setEvents(prev => [...prev, created].sort((a, b) => a.startDateTime.localeCompare(b.startDateTime)));
        toast.success('Добавлено');
      }
      setForm(emptyForm);
      setEditingId(null);
      document.getElementById('addEventForm')?.classList.add('hidden');
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
    document.getElementById('addEventForm')?.classList.remove('hidden');
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
      setEvents(prev => prev.map(ev => ev.id === editEvent.id ? updated : ev));
      setEditEvent(null);
      setEditingId(null);
      toast.success('Обновлено');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ошибка');
    }
  };

  const removeEvent = async (id: number) => {
    if (!window.confirm('Удалить событие?')) return;
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(ev => ev.id !== id));
      toast.success('Удалено');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleInvite = async () => {
    try {
      const link = await createInvitation(tripId);
      setInviteLink(link);
      setShowCopyButton(true);
      toast.success('Приглашение создано');
    } catch (err) {
      toast.error('Не удалось создать приглашение');
    }
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(inviteLink);
    toast.success('Ссылка скопирована!');
    setShowCopyButton(false);
    setInviteLink('');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;

  const grouped: { [date: string]: TimelineEvent[] } = {};
  events.forEach(ev => {
    const d = new Date(ev.startDateTime).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(ev);
  });
  const sorted = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const today = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  const next = events.length ? events[0] : null;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundImage: "url('/images/trips.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="bg-white/30 backdrop-blur-sm px-6 pt-6 pb-2 rounded-b-xl">
          <div className="flex justify-between items-center">
            <button onClick={() => navigate("/quick-access")} className="font-bold text-center rounded-xl" style={{ fontSize: "28px", color: "black", border: "3px solid black", width: "48px", height: "48px" }}>☰</button>
            <div className="font-bold text-center px-10 py-1 rounded-xl" style={{ fontSize: "22px", color: "black", border: "3px solid black", height: "48px" }}>Таймлайн</div>
            <button onClick={handleInvite} className="font-bold text-center rounded-xl px-3 py-1" style={{ fontSize: "16px", color: "white", backgroundColor: "black", border: "2px solid black", height: "40px" }}>Пригласить</button>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-4 mb-6 shadow-md mx-6 mt-4">
          <h2 className="text-lg font-bold text-gray-800">Сегодня, {today}</h2>
          {next ? (
            <div className="mt-2"><p className="text-sm text-gray-600">Ближайшее:</p><p className="font-medium text-black">{next.title} — {new Date(next.startDateTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</p></div>
          ) : <p className="text-gray-500 mt-2">Нет событий</p>}
        </div>

        {/* Кнопка копирования ссылки (показывается только после создания) */}
        {showCopyButton && (
          <div className="mx-6 mb-4">
            <button
              onClick={copyLink}
              className="w-full bg-black/80 text-white font-semibold py-2 rounded-xl hover:bg-black/90 transition backdrop-blur-sm"
            >
              Скопировать ссылку для приглашения
            </button>
          </div>
        )}

        <div className="flex-1 px-6 py-4 overflow-y-auto pb-28">
          {events.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-6 text-center"><p className="text-gray-800 font-medium">Пока нет событий</p></div>
          ) : (
            sorted.map(date => (
              <div key={date} className="mb-6">
                <h3 className="text-lg font-semibold text-white bg-black/50 inline-block px-3 py-1 rounded-full backdrop-blur-sm mb-3">{date === today ? 'Сегодня' : date}</h3>
                {grouped[date].map(ev => (
                  <div key={ev.id} className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-4 shadow-md mb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{ev.type === 'flight' ? '✈️' : ev.type === 'hotel' ? '🏨' : '🎉'}</span>
                          <p className="font-bold text-black">{ev.title}</p>
                        </div>
                        <p className="text-sm text-gray-600">{new Date(ev.startDateTime).toLocaleString()}</p>
                        {ev.locationCoords && <p className="text-sm text-gray-500">📍 {ev.locationCoords}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(ev)} className="text-blue-600">✏️</button>
                        <button onClick={() => removeEvent(ev.id)} className="text-red-600">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}

          <button onClick={() => document.getElementById('addEventForm')?.classList.toggle('hidden')} className="w-full bg-black/80 text-white font-semibold py-3 rounded-xl mb-6">+ Добавить событие</button>

          <div id="addEventForm" className="hidden bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-4 mb-6 shadow-md">
            <h3 className="text-lg font-bold mb-3">{editingId ? 'Редактировать' : 'Новое событие'}</h3>
            <form onSubmit={submitEvent} className="space-y-3">
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full border rounded-lg px-3 py-2 bg-white/80">
                <option value="flight">Перелёт</option><option value="hotel">Отель</option><option value="event">Событие</option>
              </select>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Название" className="w-full border rounded-lg px-3 py-2 bg-white/80" required />
              <input type="datetime-local" value={form.startDateTime} onChange={e => setForm({ ...form, startDateTime: e.target.value })} className="w-full border rounded-lg px-3 py-2 bg-white/80" required />
              {form.type === 'flight' && <input type="datetime-local" value={form.endDateTime} onChange={e => setForm({ ...form, endDateTime: e.target.value })} className="w-full border rounded-lg px-3 py-2 bg-white/80" />}
              <input type="text" value={form.locationCoords} onChange={e => setForm({ ...form, locationCoords: e.target.value })} placeholder="Координаты" className="w-full border rounded-lg px-3 py-2 bg-white/80" />
              <button type="submit" className="w-full bg-black text-white font-semibold py-2 rounded-lg">{editingId ? 'Сохранить' : 'Добавить'}</button>
            </form>
          </div>

          {editEvent && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-96 max-w-full">
                <h3 className="text-lg font-bold mb-3">Редактировать</h3>
                <form onSubmit={handleEditSubmit} className="space-y-3">
                  <select value={editType} onChange={e => setEditType(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                    <option value="flight">Перелёт</option><option value="hotel">Отель</option><option value="event">Событие</option>
                  </select>
                  <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Название" className="w-full border rounded-lg px-3 py-2" required />
                  <input type="datetime-local" value={editStart} onChange={e => setEditStart(e.target.value)} className="w-full border rounded-lg px-3 py-2" required />
                  {editType === 'flight' && <input type="datetime-local" value={editEnd} onChange={e => setEditEnd(e.target.value)} className="w-full border rounded-lg px-3 py-2" />}
                  <input type="text" value={editCoords} onChange={e => setEditCoords(e.target.value)} placeholder="Координаты" className="w-full border rounded-lg px-3 py-2" />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-black text-white font-semibold py-2 rounded-lg">Сохранить</button>
                    <button type="button" onClick={() => { setEditEvent(null); setEditingId(null); }} className="flex-1 bg-gray-300 font-semibold py-2 rounded-lg">Отмена</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <button onClick={() => navigate('/trips')} className="mt-4 w-full bg-gray-600/80 text-white font-semibold py-3 rounded-xl" style={{ backgroundColor: 'rgba(23, 26, 24, 0.77)' }}>← Назад к поездкам</button>
        </div>

        <div className="py-4 px-6 flex justify-around items-center bg-white/60 backdrop-blur-sm border border-white/20 rounded-full mx-4 shadow-sm">
          <button onClick={() => navigate('/weather')} className="flex flex-col items-center gap-0.5"><img src="/icons/weather.png" alt="Погода" className="w-8 h-8" /><span className="text-[10px] text-gray-700">Погода</span></button>
          <div className="w-px h-8 bg-gray-300"></div>
          <button onClick={() => navigate('/map')} className="flex flex-col items-center gap-0.5"><img src="/icons/map.png" alt="Карта" className="w-8 h-8" /><span className="text-[10px] text-gray-700">Карта</span></button>
          <div className="w-px h-8 bg-gray-300"></div>
          <button onClick={() => navigate('/chats')} className="flex flex-col items-center gap-0.5"><img src="/icons/chat.png" alt="Чат" className="w-8 h-8" /><span className="text-[10px] text-gray-700">Чат</span></button>
          <div className="w-px h-8 bg-gray-300"></div>
          <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-0.5"><img src="/icons/profile.png" alt="Профиль" className="w-8 h-8" /><span className="text-[10px] text-gray-700">Профиль</span></button>
        </div>
      </div>
    </div>
  );
};