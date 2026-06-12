import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/Auth/LoginPage";
import { RegisterPage } from "./pages/Auth/RegisterPage";
import { TripsPage } from "./pages/Trips/TripsPage";
import { MobileContainer } from "./components/MobileContainer";

// Временная заглушка для нереализованных страниц
const TripTimelinePage = () => <div>Таймлайн поездки (в разработке)</div>
const AddTripPage = () => <div>Страница добавления поездки (в разработке)</div>
function App() {
  return (
    <BrowserRouter>
      <MobileContainer>
        {/* Глобальный контейнер: фон и шрифты */}
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
          <Routes>
            {/* Экраны авторизации */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/trips" element={<TripsPage />} />
          </Routes>
        </div>
      </MobileContainer>
    </BrowserRouter>
  );
}

export default App;
