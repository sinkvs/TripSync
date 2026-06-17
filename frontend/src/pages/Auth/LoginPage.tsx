import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';

export const LoginPage = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const registered = location.state?.registered === true;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // для показа/скрытия пароля
  const [showPasswordTooltip, setShowPasswordTooltip] = useState(false); // для всплывающей подсказки

  const handleLogin = async (e: React.FormEvent) => {
    console.log("1. Кнопка 'войти' нажата");
    e.preventDefault(); // не перезагружаем страницу
    setError(""); // очищаем старую ошибку

    console.log("2. После preventDefault и setError");

    try {
      console.log("3. Вход в try, перед axios.post");
      // Отправляем POST запрос на бэк (содержит email и пароль)
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      console.log("4. После axios.post, response получен", response);

      // Получаем из ответа пользователя и токен
      const { user, token } = response.data;
      // TODO: user сохранить в глобальный стор

      console.log("5. Деструктуризация прошла");

      // Сохраняем JWT токен в localStorage, что позволит оставаться пользователю в системе при перезагрузке страницы
      localStorage.setItem("token", token);

      if (rememberMe)
        localStorage.setItem("rememberMe", "true");


      console.log("Перед navigate");
      // Переходим на страницу trips (список поездок)
      navigate("/trips");
      console.log("После navigate");
    } catch (err: any) {

      console.log("6. Попали в catch", err);
      setError(err.response?.data?.message || "Ошибка входа"); // обрабатываем ошибку от сервера
    }
    console.log("7. Конец функции");
  };

  return (
    // Этот div отвечает за фон
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/images/bg.jpg')",     // путь к картинке
        backgroundSize: "cover",                      // растянуть на весь экран
        backgroundPosition: "center",                 // по центру
        backgroundRepeat: "no-repeat",                // не повторять
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

        {registered && (
          <div className="bg-white/70 backdrop-blur-sm border-2 border-black rounded-xl p-4 mb-6 shadow-md text-center">
             <p className="text-black font-medium">✅ Регистрация успешна!</p>
             <p className="text-gray-700 text-sm mt-1">Подтвердите email, перейдя по ссылке из письма.</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* Поле Email - прозрачное с чёрной обводкой */}
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
          {/* Поле Пароль - прозрачное с чёрной обводкой + глазик */}
          <div
            className="relative w-full"
            onMouseEnter={() => setShowPasswordTooltip(true)}
            onMouseLeave={() => setShowPasswordTooltip(false)}
          >
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 rounded-xl text-black placeholder-black font-medium transition bg-transparent pr-12"
              style={{
                fontSize: "16px",
                borderRadius: "12px",
                height: "52px",
                border: "2px solid black",
              }}
              required
            />

            {/* Глазик для показа/скрытия пароля */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black text-xl"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>

            {/* Всплывающая подсказка с требованиями к паролю */}
            {showPasswordTooltip && (
              <div
                className="absolute z-50 bg-black text-white text-sm rounded-lg p-3 mt-2"
                style={{
                  bottom: "100%",
                  left: "0",
                  marginBottom: "8px",
                  minWidth: "200px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              >
                <div className="font-semibold mb-2">Требования к паролю:</div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Минимум 6 символов</li>
                  <li>Хотя бы одна цифра</li>
                  <li>Хотя бы одна заглавная буква</li>
                  <li>Строчные буквы</li>
                </ul>
                {/* Стрелочка вниз */}
                <div
                  className="absolute w-3 h-3 bg-black transform rotate-45"
                  style={{ bottom: "-6px", left: "20px" }}
                ></div>
              </div>
            )}
          </div>

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
            style={{
              height: "52px",
              fontSize: "16px",
              borderRadius: "12px",
              backgroundColor: "rgb(19, 19, 19)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(51, 51, 51, 0.9)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(51, 51, 51, 0.61)")
            }
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
            backgroundColor: "rgba(23, 26, 24, 0.77)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(63, 68, 66, 0.6)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(23, 26, 24, 0.77)")
          }
        >
          Зарегистрироваться
        </button>
      </div>
    </div>
  );
};
