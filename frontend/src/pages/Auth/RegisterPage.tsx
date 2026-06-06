import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export const RegisterPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // для показа/скрытия пароля
  const [showPasswordTooltip, setShowPasswordTooltip] = useState(false); // для всплывающей подсказки
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [verificationLink, setVerificationLink] = useState("");
  const [showLink, setShowLink] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
      });
      const { verificationLink, user, message } = response.data;

      setVerificationLink(verificationLink);
      setShowLink(true);

  } catch (error: any) {
    const errMsg = error.response?.data?.message || "Ошибка регистрации";
    setError(errMsg);
    alert(errMsg);
  } finally {
    setIsLoading(false);
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
        backgroundRepeat: "no-repeat", // не повтоять
      }}
    >
      <div className="absolute inset-0 bg-black/40" style={{ zIndex: 1 }}></div>

      {/* Основной контент (поверх фона) */}
      <div
        className="relative z-10 flex-1 flex flex-col justify-center px-5"
        style={{ paddingTop: "60px", paddingBottom: "40px" }}
      >
        <h1
          className="font-bold text-gray-900 text-center mb-10"
          style={{ fontSize: "24px", lineHeight: "32px" }}
        >
          Создать аккаунт
        </h1>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {/* Поле Имя - прозрачное с чёрной обводкой */}
          <input
            type="text"
            placeholder="Имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 rounded-xl text-black placeholder-black font-semibold transition bg-transparent"
            style={{
              fontSize: "16px",
              borderRadius: "12px",
              height: "52px",
              border: "2px solid black",
            }}
            required
          />

          {/* Поле Email - прозрачное с чёрной обводкой */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 rounded-xl text-black placeholder-black font-semibold transition bg-transparent"
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
            Зарегистрироваться
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

        {/* Блок отображения ссылки после успешной регистрации */}
        {showLink && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-300">
            <p className="text-sm text-gray-700 mb-2">Для подтверждения email перейдите по ссылке:</p>
            <a
              href={verificationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 break-all text-sm"
            >
              {verificationLink}
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(verificationLink);
                alert("Ссылка скопирована в буфер обмена!");
              }}
              className="mt-2 text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Копировать ссылку
            </button>
          </div>
        )}

        <button
          onClick={() => navigate("/login")}
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
          Уже есть аккаунт? Войти
        </button>
      </div>
    </div>
  );
};
