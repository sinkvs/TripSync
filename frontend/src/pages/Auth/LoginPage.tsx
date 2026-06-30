import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import { useAuthStore } from "../../stores/useAuthStore"; // <-- импорт

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuthStore(); // <-- получаем функцию
  const registered = location.state?.registered === true;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordTooltip, setShowPasswordTooltip] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberMeEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setError("Введите корректный email");
      return;
    }

    if (!PASSWORD_REGEX.test(normalizedPassword)) {
      setError("Пароль должен содержать минимум 6 символов, цифру, строчную и заглавную буквы");
      return;
    }

    try {
      const response = await axios.post("/api/auth/login", {
        email: normalizedEmail,
        password: normalizedPassword,
      });

      const { user, token } = response.data;
      if (!token || !user) {
        setError("Неверный ответ сервера");
        return;
      }

      // Сохраняем в localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userId", String(user.id));

      if (rememberMe) {
        localStorage.setItem("rememberMeEmail", normalizedEmail);
      } else {
        localStorage.removeItem("rememberMeEmail");
      }

      // ✅ ОБНОВЛЯЕМ ХРАНИЛИЩЕ
      setSession(token, user);

      // Переходим на страницу поездок
      navigate("/trips");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Ошибка входа");
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
            onClick={() => navigate('/request-reset')}
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