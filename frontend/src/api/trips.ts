import api from './client';
import type { TimelineEvent, Trip } from '../types/trip';

export const getTrips = async () => {
  const response = await api.get<{ trips: Trip[] }>('/api/trips');
  return response.data.trips;
};

export const getTrip = async (tripId: number) => {
  const response = await api.get<{ trip: Trip }>('/api/trips/' + tripId);
  return response.data.trip;
};

export const createTrip = async (payload: {
  title: string;
  startDate: string;
  endDate: string;
}) => {
  const response = await api.post<{ trip: Trip }>('/api/trips', payload);
  return response.data.trip;
};

export const deleteTrip = async (tripId: number) => {
  await api.delete('/api/trips/' + tripId);
};

export const getEvents = async (tripId: number) => {
  const response = await api.get<{ events: TimelineEvent[] }>(`/api/trips/${tripId}/events`);
  return response.data.events;
};

export const createEvent = async (
  tripId: number,
  payload: {
    type: string;
    title: string;
    startDateTime: string;
    endDateTime?: string;
    locationCoords?: string;
  }
) => {
  const response = await api.post<{ event: TimelineEvent }>(`/api/trips/${tripId}/events`, payload);
  return response.data.event;
};

export const updateEvent = async (
  eventId: number,
  payload: Partial<{
    type: string;
    title: string;
    startDateTime: string;
    endDateTime: string;
    locationCoords: string;
  }>
) => {
  const response = await api.put<{ event: TimelineEvent }>(`/api/trips/events/${eventId}`, payload);
  return response.data.event;
};

export const deleteEvent = async (eventId: number) => {
  await api.delete(`/api/trips/events/${eventId}`);
};