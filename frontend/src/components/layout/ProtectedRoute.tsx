import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

export const ProtectedRoute = () => {
  const location = useLocation();
  const { token, user, initialized, syncFromStorage, fetchMe } = useAuthStore();

  useEffect(() => {
    syncFromStorage();
  }, [syncFromStorage]);

  useEffect(() => {
    if (!user && localStorage.getItem('token')) {
      fetchMe().catch(() => {
        useAuthStore.getState().logout();
      });
    }
  }, [fetchMe, user]);

  const effectiveToken = token || localStorage.getItem('token');

  if (!effectiveToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!initialized || (!user && effectiveToken)) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-stone-600">Загрузка профиля...</div>;
  }

  return <Outlet />;
};