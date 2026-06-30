import { useState } from 'react';
import toast from 'react-hot-toast';
import { uploadDocument } from '../../api/documents';
import type { DocumentCategory, TimelineEvent, TripDocument } from '../../types/trip';

type Props = {
  tripId: number;
  events: TimelineEvent[];
  onUploaded: (document: TripDocument) => void;
};

export const DocumentUploader = ({ tripId, events, onUploaded }: Props) => {
  const [category, setCategory] = useState<DocumentCategory>('flight');
  const [eventId, setEventId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      toast.error('Выберите файл');
      return;
    }

    setLoading(true);
    try {
      const document = await uploadDocument(tripId, {
        file,
        category,
        eventId: eventId ? Number(eventId) : undefined,
      });

      onUploaded(document);
      setFile(null);
      setEventId('');
      toast.success('Документ загружен');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Не удалось загрузить документ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[24px] bg-white p-4 shadow-sm">
      <div className="grid gap-3">
        <div>
          <div className="mb-2 text-sm font-medium text-stone-800">Категория</div>
          <select value={category} onChange={(event) => setCategory(event.target.value as DocumentCategory)} className="w-full rounded-2xl border border-stone-200 px-4 py-3">
            <option value="flight">Трансфер</option>
            <option value="hotel">Проживание</option>
            <option value="event">События</option>
          </select>
        </div>
        <div>
          <div className="mb-2 text-sm font-medium text-stone-800">Связать с событием</div>
          <select value={eventId} onChange={(event) => setEventId(event.target.value)} className="w-full rounded-2xl border border-stone-200 px-4 py-3">
            <option value="">Без привязки</option>
            {events.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>
        <label className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-5 text-sm text-stone-600">
          <span className="block font-medium text-stone-800">PDF или изображение</span>
          <span className="mt-1 block">Выберите билет, бронь или подтверждение мероприятия</span>
          <input
            type="file"
            accept=".pdf,image/*"
            className="mt-3 block w-full"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
        </label>
        <button type="submit" disabled={loading} className="rounded-2xl bg-stone-900 px-4 py-3 font-semibold text-white disabled:opacity-60">
          {loading ? 'Загрузка...' : 'Загрузить документ'}
        </button>
      </div>
    </form>
  );
};