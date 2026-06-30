import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Отсутствует токен');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Пароль должен быть не менее 6 символов');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', { token, newPassword });
      toast.success('Пароль успешно изменён');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка сброса пароля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/images/bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="relative z-10 flex-1 flex flex-col justify-center px-5">
        <h1 className="font-bold text-gray-900 text-center mb-10 text-2xl">
          Установить новый пароль
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Новый пароль"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 rounded-xl text-black placeholder-black font-medium transition bg-transparent"
            style={{
              fontSize: "16px",
              borderRadius: "12px",
              height: "52px",
              border: "2px solid black",
            }}
            required
            minLength={6}
          />
          <input
            type="password"
            placeholder="Подтвердите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 rounded-xl text-black placeholder-black font-medium transition bg-transparent"
            style={{
              fontSize: "16px",
              borderRadius: "12px",
              height: "52px",
              border: "2px solid black",
            }}
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition mt-2"
            style={{
              height: "52px",
              fontSize: "16px",
              borderRadius: "12px",
            }}
          >
            {loading ? 'Сброс...' : 'Сбросить пароль'}
          </button>
        </form>
      </div>
    </div>
  );
};