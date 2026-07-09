import type { NavigateFunction } from 'react-router-dom';

const ACTIVE_TRIP_ID_KEY = 'activeTripId';

export const setActiveTripId = (tripId: number) => {
  if (!Number.isInteger(tripId) || tripId <= 0) return;
  localStorage.setItem(ACTIVE_TRIP_ID_KEY, String(tripId));
};

export const getActiveTripId = () => {
  const rawValue = localStorage.getItem(ACTIVE_TRIP_ID_KEY);
  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
};

export const goToTimelineHome = (
  navigate: NavigateFunction,
  fallbackTripId?: number | null
) => {
  const tripId = fallbackTripId ?? getActiveTripId();

  if (tripId) {
    navigate(`/trip/${tripId}/timeline`);
    return;
  }

  navigate('/trips');
};
