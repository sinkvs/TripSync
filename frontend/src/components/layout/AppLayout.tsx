import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useOfflineStore } from '../../stores/useOfflineStore';

const navItems = [
  { to: '/trips', label: 'Поездки' },
  { to: '/chats', label: 'Чат' },
  { to: '/map', label: 'Карта' },
  { to: '/profile', label: 'Профиль' },
];

export const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { isOnline, initialize } = useOfflineStore();
  
  useEffect(() => {
    initialize();
  }, [initialize]);

  const hideBottomNav = location.pathname === '/chat' || location.pathname === '/chats';

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate('/trips')} className="rounded-full bg-stone-900 px-3 py-1 text-sm font-semibold text-white">
            TripSync
          </button>
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <span className={`inline-flex h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span>{isOnline ? 'online' : 'offline'}</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 px-4 pb-3 text-xs text-stone-600">
          <div>
            <div className="font-medium text-stone-900">{user?.name || 'Путешественник'}</div>
            <div>{user?.email}</div>
          </div>
          {user?.role === 'ADMIN' && (
            <button onClick={() => navigate('/admin')} className="rounded-xl border border-stone-300 px-3 py-2 text-stone-800">
              Админ
            </button>
          )}
        </div>
      </div>

      <main className={`${hideBottomNav ? '' : 'pb-20'}`}>
        <Outlet />
      </main>

      {!hideBottomNav && (
        <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-[430px] justify-between border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-xs font-medium ${isActive ? 'bg-stone-900 text-white' : 'text-stone-600'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
};