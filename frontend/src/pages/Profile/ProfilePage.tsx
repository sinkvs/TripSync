import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { changePassword, updateProfile } from '../../api/user';
import { BottomNav } from '../../components/layout/BottomNav';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { useAuthStore } from '../../stores/useAuthStore';
import { goToTimelineHome } from '../../utils/tripNavigation';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Имя не может быть пустым');
      return;
    }
    setIsUpdatingName(true);
    try {
      const updatedUser = await updateProfile({ name: name.trim() });
      updateUser(updatedUser);
      toast.success('Имя обновлено');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Не удалось обновить имя');
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Новый пароль должен содержать минимум 6 символов');
      return;
    }
    setIsChangingPassword(true);
    try {
      await changePassword({ oldPassword, newPassword });
      toast.success('Пароль изменён');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Не удалось сменить пароль');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    // Сначала удаляем всё из localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('rememberMeEmail');
    // Потом обнуляем стор
    logout();
    toast.success('Вы вышли из аккаунта');
    // Принудительная перезагрузка для сброса состояния
    window.location.href = '/login';
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/images/trips.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="relative z-10 flex min-h-screen flex-col">
        <ScreenHeader
          title="Профиль"
          left={
            <button
              type="button"
              onClick={() => goToTimelineHome(navigate)}
              className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black text-2xl text-black"
            >
              ←
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 sm:px-6">
          <div className="space-y-4">
            <div className="rounded-xl border border-white/30 bg-white/70 p-4 shadow-md backdrop-blur-sm">
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="rounded-lg border border-gray-200 bg-white/50 px-3 py-1.5 text-sm text-gray-900">
                  {user?.email}
                </p>
              </div>
              <form onSubmit={handleUpdateName} className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Имя</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white/80 px-3 py-1.5 text-sm focus:ring-2 focus:ring-black/50"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUpdatingName}
                  className="w-full rounded-xl bg-black/80 py-2 text-sm font-semibold text-white transition hover:bg-black/90 disabled:opacity-50"
                >
                  {isUpdatingName ? 'Сохранение...' : 'Сохранить имя'}
                </button>
              </form>
            </div>

            <div className="rounded-xl border border-white/30 bg-white/70 p-4 shadow-md backdrop-blur-sm">
              <h3 className="mb-2 text-md font-semibold text-gray-800">Сменить пароль</h3>
              <form onSubmit={handleChangePassword} className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Текущий пароль</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white/80 px-3 py-1.5 text-sm focus:ring-2 focus:ring-black/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Новый пароль</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white/80 px-3 py-1.5 text-sm focus:ring-2 focus:ring-black/50"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Подтверждение пароля</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white/80 px-3 py-1.5 text-sm focus:ring-2 focus:ring-black/50"
                    required
                    minLength={6}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full rounded-xl bg-black/80 py-2 text-sm font-semibold text-white transition hover:bg-black/90 disabled:opacity-50"
                >
                  {isChangingPassword ? 'Смена пароля...' : 'Сменить пароль'}
                </button>
              </form>
            </div>

            <button
              onClick={handleLogout}
              className="w-full rounded-xl bg-red-600/80 py-3 text-sm font-semibold text-white transition hover:bg-red-700/80 backdrop-blur-sm"
            >
              Выйти из аккаунта
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
};