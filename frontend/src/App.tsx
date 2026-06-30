import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/Auth/LoginPage";
import { RegisterPage } from "./pages/Auth/RegisterPage";
import { TripsPage } from "./pages/Trips/TripsPage";
import { AddTripPage } from "./pages/Trips/AddTripPage";
import { ChatListPage } from "./pages/Chat/ChatListPage";
import { ChatPage } from './pages/Chat/ChatPage';
import { MobileContainer } from "./components/MobileContainer";
import { TimelinePage } from "./pages/TripDetail/TimelinePage";
import { QuickAccessPage } from "./pages/QuickAccess/QuickAccessPage";
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from "./components/layout/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <MobileContainer>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
          <Routes>
            {/* Публичные маршруты */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Защищённые маршруты (группируем через ProtectedRoute) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/trips" element={<TripsPage />} />
              <Route path="/trip/:id/timeline" element={<TimelinePage />} />
              <Route path="/add-trip" element={<AddTripPage />} />
              <Route path="/chats" element={<ChatListPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/quick-access" element={<QuickAccessPage />} />
            </Route>

            {/* Если маршрут не найден – редирект на /trips или /login */}
            <Route path="*" element={<Navigate to="/trips" replace />} />
          </Routes>
          <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            containerStyle={{
              zIndex: 9999,               // чтобы уведомления были поверх всего
            }}
            toastOptions={{
              duration: 3000,             // время показа в мс
              style: {
                background: '#000',       // чёрный фон
                color: '#fff',            // белый текст
                borderRadius: '12px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: 500,
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',     // зелёная иконка
                  secondary: '#000',      // фон иконки (чёрный, чтобы сливался с фоном)
                },
                style: {
                  background: '#000',
                  color: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',     // красная иконка
                  secondary: '#000',
                },
                style: {
                  background: '#000',
                  color: '#fff',
                },
              },
            }}
          />
        </div>
      </MobileContainer>
    </BrowserRouter>
  );
}

export default App;