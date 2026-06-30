import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export const RequestResetPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Введите email');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/request-reset', { email });
      setResetLink(response.data.resetLink);
      toast.success('Ссылка для сброса пароля создана');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка запроса');
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
          Восстановление пароля
        </h1>

        {!resetLink ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 rounded-xl text-black placeholder-black font-medium transition bg-transparent"
              style={{
                fontSize: "16px",
                borderRadius: "12px",
                height: "52px",
                border: "2px solid black",
              }}
              required
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
              {loading ? 'Отправка...' : 'Отправить ссылку'}
            </button>
          </form>
        ) : (
          <div className="bg-white/70 backdrop-blur-sm border-2 border-black rounded-xl p-4 shadow-md text-center">
            <p className="text-black font-medium">✅ Ссылка для сброса пароля создана</p>
            <p className="text-gray-700 text-sm mt-1">Перейдите по ссылке, чтобы установить новый пароль:</p>
            <div className="flex flex-col gap-3 mt-3">
              <button
                onClick={() => window.open(resetLink, '_blank')}
                className="bg-black text-white px-6 py-2 rounded-xl hover:bg-gray-800 transition"
              >
                Перейти к сбросу пароля
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-gray-600 text-white px-6 py-2 rounded-xl hover:bg-gray-700 transition"
              >
                Назад к входу
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};