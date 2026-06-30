import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { blockUser, deleteTripAsAdmin, getAdminDashboard, unblockUser } from '../../api/admin';
import type { Trip } from '../../types/trip';
import type { User } from '../../types/user';

export const AdminPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);

  const loadDashboard = () => {
    getAdminDashboard()
      .then((payload) => {
        setUsers(payload.users);
        setTrips(payload.trips);
      })
      .catch((error) => toast.error(error.response?.data?.message || 'Не удалось загрузить админ-панель'));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const toggleBlock = async (user: User) => {
    try {
      if (user.isBlocked) {
        await unblockUser(user.id);
      } else {
        await blockUser(user.id);
      }
      loadDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Не удалось изменить статус пользователя');
    }
  };

  const handleDeleteTrip = async (tripId: number) => {
    try {
      await deleteTripAsAdmin(tripId);
      setTrips((current) => current.filter((trip) => trip.id !== tripId));
      toast.success('Поездка удалена');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Не удалось удалить поездку');
    }
  };

  return (
    <div className="space-y-4 px-4 py-5">
      <div className="rounded-[28px] bg-[linear-gradient(135deg,#111827,#1d4ed8)] p-5 text-white shadow-lg">
        <div className="text-sm uppercase tracking-[0.18em] text-blue-200">Admin</div>
        <h1 className="mt-2 text-3xl font-semibold">Управление платформой</h1>
      </div>

      <section className="rounded-[24px] bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Пользователи</h2>
        <div className="mt-4 space-y-3">
          {users.map((user) => (
            <div key={user.id} className="rounded-2xl border border-stone-100 p-3">
              <div className="font-medium text-stone-900">{user.name}</div>
              <div className="text-sm text-stone-500">{user.email}</div>
              <div className="mt-1 text-xs text-stone-400">Роль: {user.role} · Статус: {user.isBlocked ? 'blocked' : 'active'}</div>
              <button onClick={() => toggleBlock(user)} className="mt-3 rounded-full bg-stone-900 px-3 py-2 text-xs font-medium text-white">
                {user.isBlocked ? 'Разблокировать' : 'Заблокировать'}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Поездки</h2>
        <div className="mt-4 space-y-3">
          {trips.map((trip) => (
            <div key={trip.id} className="flex items-center justify-between rounded-2xl border border-stone-100 p-3">
              <div>
                <div className="font-medium text-stone-900">{trip.title}</div>
                <div className="text-sm text-stone-500">
                  {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                </div>
              </div>
              <button onClick={() => handleDeleteTrip(trip.id)} className="rounded-full bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                Удалить
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};