import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { updateProfile, changePassword } from '../../api/user';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

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

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/images/trips.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Верхняя панель */}
        <div className="bg-white/30 backdrop-blur-sm px-6 pt-6 pb-2 rounded-b-xl">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/trips')}
              className="font-bold text-center rounded-xl"
              style={{
                fontSize: "28px",
                color: "black",
                backgroundColor: "transparent",
                border: "3px solid black",
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ←
            </button>
            <div
              className="font-bold text-center px-10 py-1 rounded-xl"
              style={{
                fontSize: "22px",
                lineHeight: "28px",
                color: "black",
                backgroundColor: "transparent",
                border: "3px solid black",
                display: "inline-block",
                height: "48px",
              }}
            >
              Профиль
            </div>
            <div className="w-8"></div>
          </div>
        </div>

        {/* Контент – с отступом снизу для фиксированной навигации */}
        <div className="flex-1 px-6 py-4 overflow-y-auto pb-32">
          <div className="space-y-4">
            {/* Карточка с именем */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-4 shadow-md">
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900 bg-white/50 rounded-lg px-3 py-1.5 text-sm border border-gray-200">
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white/80 focus:ring-2 focus:ring-black/50"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUpdatingName}
                  className="w-full bg-black/80 text-white font-semibold py-2 rounded-xl hover:bg-black/90 transition disabled:opacity-50 text-sm"
                >
                  {isUpdatingName ? 'Сохранение...' : 'Сохранить имя'}
                </button>
              </form>
            </div>

            {/* Карточка смены пароля */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-4 shadow-md">
              <h3 className="text-md font-semibold text-gray-800 mb-2">Сменить пароль</h3>
              <form onSubmit={handleChangePassword} className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Текущий пароль</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white/80 focus:ring-2 focus:ring-black/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Новый пароль</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white/80 focus:ring-2 focus:ring-black/50"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white/80 focus:ring-2 focus:ring-black/50"
                    required
                    minLength={6}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full bg-black/80 text-white font-semibold py-2 rounded-xl hover:bg-black/90 transition disabled:opacity-50 text-sm"
                >
                  {isChangingPassword ? 'Смена пароля...' : 'Сменить пароль'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ФИКСИРОВАННАЯ нижняя навигация – как на QuickAccess */}
        <div className="fixed bottom-4 left-0 right-0 z-20 flex justify-center pointer-events-none">
          <div className="pointer-events-auto w-full max-w-[430px] px-4">
            <div className="py-4 px-6 flex justify-around items-center bg-white/60 backdrop-blur-sm border border-white/20 rounded-full shadow-sm">
              <button onClick={() => navigate('/weather')} className="flex flex-col items-center gap-0.5">
                <img src="/icons/weather.png" alt="Погода" className="w-8 h-8" />
                <span className="text-[10px] text-gray-700">Погода</span>
              </button>
              <div className="w-px h-8 bg-gray-300"></div>
              <button onClick={() => navigate('/map')} className="flex flex-col items-center gap-0.5">
                <img src="/icons/map.png" alt="Карта" className="w-8 h-8" />
                <span className="text-[10px] text-gray-700">Карта</span>
              </button>
              <div className="w-px h-8 bg-gray-300"></div>
              <button onClick={() => navigate('/chats')} className="flex flex-col items-center gap-0.5">
                <img src="/icons/chat.png" alt="Чат" className="w-8 h-8" />
                <span className="text-[10px] text-gray-700">Чат</span>
              </button>
              <div className="w-px h-8 bg-gray-300"></div>
              <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-0.5">
                <img src="/icons/profile.png" alt="Профиль" className="w-8 h-8" />
                <span className="text-[10px] text-gray-700">Профиль</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};