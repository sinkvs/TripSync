import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const TripsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("rememberMe");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-black text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Мои поездки</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
        >
          Выйти
        </button>
      </div>

      <div className="flex-1 px-6 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Добро пожаловать!
          </h2>
          <p className="text-gray-600">Здесь будет список поездок</p>
        </div>

        <div className="grid gap-4 mt-8">
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800">Поездка в Париж</h3>
            <p className="text-gray-600 text-sm mt-1">Дата: 15-20 июня 2024</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800">Поездка в Лондон</h3>
            <p className="text-gray-600 text-sm mt-1">Дата: 1-5 августа 2024</p>
          </div>
        </div>
      </div>
    </div>
  );
};
