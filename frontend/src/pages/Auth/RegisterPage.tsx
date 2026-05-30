import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const RegisterPage = () => {
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Сохраняем в localStorage, что залогинены
    localStorage.setItem('isLoggedIn', 'true');
    navigate('/trips');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 pt-12 pb-8">
        
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Создать аккаунт
        </h1>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          
          <input
            type="text"
            placeholder="Имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition"
            required
          />

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition"
            required
          />

          <button
            type="submit"
            className="w-full bg-black text-white font-semibold py-3.5 rounded-xl hover:bg-gray-900 active:bg-gray-800 transition mt-2"
          >
            Зарегистрироваться
          </button>

        </form>

        <div className="my-6 border-t border-gray-300"></div>

        <button
          onClick={() => navigate('/login')}
          className="w-full bg-gray-700 text-white font-semibold py-3.5 rounded-xl hover:bg-gray-800 active:bg-gray-900 transition"
        >
          Войти
        </button>

      </div>
    </div>
  );
};