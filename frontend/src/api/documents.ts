import api from './client';
import type { TripDocument } from '../types/trip';

// Получение документов поездки
export const getDocumentsByTrip = async (tripId: number) => {
  const response = await api.get<{ documents: TripDocument[] }>(`/api/trips/${tripId}/documents`);
  return response.data.documents;
};

// Загрузка нового документа
export const uploadDocument = async (
  tripId: number,
  payload: {
    file: File;
    category: string;
    eventId?: number;
  }
) => {
  const formData = new FormData();
  formData.append('file', payload.file);
  formData.append('category', payload.category);
  if (payload.eventId) {
    formData.append('eventId', String(payload.eventId));
  }

  const response = await api.post<{ document: TripDocument }>(`/api/trips/${tripId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data.document;
};

// Скачивание документа
export const downloadDocument = async (documentId: number) => {
  const response = await api.get(`/api/documents/${documentId}`, {
    responseType: 'blob',
  });

  return response.data as Blob;
};

// Удаление документа
export const deleteDocument = async (documentId: number) => {
  await api.delete(`/api/documents/${documentId}`);
};