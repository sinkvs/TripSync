import toast from 'react-hot-toast';
import { deleteDocument, downloadDocument } from '../../api/documents';
import type { TripDocument } from '../../types/trip';

type Props = {
  title: string;
  documents: TripDocument[];
  onDeleted: (documentId: number) => void;
};

export const DocumentList = ({ title, documents, onDeleted }: Props) => {
  const handleDownload = async (tripDocument: TripDocument) => {
    try {
      const blob = await downloadDocument(tripDocument.id);
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = tripDocument.fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Не удалось скачать документ');
    }
  };

  const handleDelete = async (documentId: number) => {
    try {
      await deleteDocument(documentId);
      onDeleted(documentId);
      toast.success('Документ удален');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Не удалось удалить документ');
    }
  };

  return (
    <section className="rounded-[24px] bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">{title}</div>
      {documents.length === 0 ? (
        <p className="text-sm text-stone-400">Пока пусто</p>
      ) : (
        <div className="space-y-3">
          {documents.map((document) => (
            <div key={document.id} className="rounded-2xl border border-stone-100 bg-stone-50 p-3">
              <div className="font-medium text-stone-900">{document.fileName}</div>
              <div className="mt-1 text-xs text-stone-500">
                {document.event?.title ? `Событие: ${document.event.title}` : 'Без привязки к событию'}
              </div>
              <div className="mt-1 text-xs text-stone-500">
                Загрузил: {document.uploader?.name || 'участник'} · {new Date(document.createdAt).toLocaleString()}
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => handleDownload(document)} className="rounded-full bg-stone-900 px-3 py-2 text-xs font-medium text-white">
                  Скачать
                </button>
                <button onClick={() => handleDelete(document.id)} className="rounded-full bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};