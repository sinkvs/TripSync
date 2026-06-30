import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { MobileContainer } from "./components/MobileContainer";
// import { AppLayout } from "./components/layout/AppLayout";  // не используем
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { useAuthStore } from "./stores/useAuthStore";
import { LoginPage } from "./pages/Auth/LoginPage";
import { RegisterPage } from "./pages/Auth/RegisterPage";
import { TripsPage } from "./pages/Trips/TripsPage";
import { AddTripPage } from "./pages/Trips/AddTripPage";
import { TimelinePage } from "./pages/TripDetail/TimelinePage";
import { QuickAccessPage } from "./pages/QuickAccess/QuickAccessPage";
import { ChatListPage } from "./pages/Chat/ChatListPage";
import { ChatPage } from './pages/Chat/ChatPage';
// import { WeatherPage } from "./pages/Weather/WeatherPage";   // временно отключено
// import { MapPage } from "./pages/Map/MapPage";               // временно отключено
import { ProfilePage } from "./pages/Profile/ProfilePage";
import { AdminPage } from "./pages/Admin/AdminPage";
import { RequestResetPage } from "./pages/Auth/RequestResetPage";
import { ResetPasswordPage } from "./pages/Auth/ResetPasswordPage";
import { JoinPage } from "./pages/JoinPage";

const AdminRoute = () => {
  const user = useAuthStore((state) => state.user);
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/trips" replace />;
  }
  return <AdminPage />;
};

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
            <Route path="/request-reset" element={<RequestResetPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Защищённые маршруты (без AppLayout) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/trips" element={<TripsPage />} />
              <Route path="/trip/:id/timeline" element={<TimelinePage />} />
              <Route path="/add-trip" element={<AddTripPage />} />
              <Route path="/quick-access" element={<QuickAccessPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminRoute />} />
              <Route path="/chats" element={<ChatListPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/join" element={<JoinPage />} />
              {/* <Route path="/weather" element={<WeatherPage />} /> */}
              {/* <Route path="/map" element={<MapPage />} /> */}
            </Route>

            <Route path="*" element={<Navigate to="/trips" replace />} />
          </Routes>
          <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            containerStyle={{ zIndex: 9999 }}
            toastOptions={{
              duration: 3000,
              style: {
                background: '#000',
                color: '#fff',
                borderRadius: '12px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: 500,
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#000' },
                style: { background: '#000', color: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#000' },
                style: { background: '#000', color: '#fff' },
              },
            }}
          />
        </div>
      </MobileContainer>
    </BrowserRouter>
  );
}

export default App;