import api from './client';
import type { TripDocument } from '../types/trip';

export const getDocumentsByTrip = async (tripId: number) => {
  const response = await api.get<{ documents: TripDocument[] }>(`/trips/${tripId}/documents`);
  return response.data.documents;
};

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

  const response = await api.post<{ document: TripDocument }>(`/trips/${tripId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data.document;
};

export const downloadDocument = async (documentId: number) => {
  const response = await api.get(`/documents/${documentId}`, {
    responseType: 'blob',
  });

  return response.data as Blob;
};

export const deleteDocument = async (documentId: number) => {
  await api.delete(`/documents/${documentId}`);
};