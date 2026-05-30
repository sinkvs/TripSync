import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const testUser = {
      email: "test@test.com",
      password: "123",
    };

    if (email === testUser.email && password === testUser.password) {
      localStorage.setItem("isLoggedIn", "true");
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }
      navigate("/trips");
    } else {
      setError("Неверный email или пароль");
    }
  };

  return (
    // Этот div отвечает за фон
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/images/bg.jpg')", // путь к картинке
        backgroundSize: "cover", // растянуть на весь экран
        backgroundPosition: "center", // по центру
        backgroundRepeat: "no-repeat", // не повторять
      }}
    >
      {/* Основной контент (поверх фона) */}
      <div
        className="relative z-10 flex-1 flex flex-col justify-center px-5"
        style={{ paddingTop: "60px", paddingBottom: "40px" }}
      >
        <h1
          className="font-bold text-gray-900 text-center mb-10"
          style={{ fontSize: "24px", lineHeight: "32px" }}
        >
          Добро пожаловать в новое путешествие!
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 transition"
            style={{ fontSize: "16px", borderRadius: "12px", height: "52px" }}
            required
          />

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 transition"
            style={{ fontSize: "16px", borderRadius: "12px", height: "52px" }}
            required
          />

          {error && (
            <div className="text-red-500 text-sm text-center py-1">{error}</div>
          )}

          <label
            className="flex items-center gap-2 cursor-pointer"
            style={{ marginTop: "4px" }}
          >
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 border border-gray-300 rounded"
            />
            <span className="text-gray-700" style={{ fontSize: "15px" }}>
              Запомнить меня
            </span>
          </label>

          <button
            type="submit"
            className="w-full bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition mt-2"
            style={{ height: "52px", fontSize: "16px", borderRadius: "12px" }}
          >
            Войти
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            className="text-gray-500 hover:text-gray-700 transition"
            style={{ fontSize: "14px" }}
          >
            Забыли пароль?
          </button>
        </div>

        <div
          className="my-6"
          style={{ marginTop: "32px", marginBottom: "32px" }}
        >
          <div className="border-t border-gray-200"></div>
        </div>

        <button
          onClick={() => navigate("/register")}
          className="w-full bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition"
          style={{
            height: "52px",
            fontSize: "16px",
            borderRadius: "12px",
            backgroundColor: "rgb(44,85,69)",
          }}
        >
          Зарегистрироваться
        </button>
      </div>
    </div>
  );
};
