import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { deleteTrip as deleteTripRequest, getTrips } from "../../api/trips";
import { BottomNav } from "../../components/layout/BottomNav";
import { ScreenHeader } from "../../components/layout/ScreenHeader";
import type { Trip } from "../../types/trip";
import { setActiveTripId } from "../../utils/tripNavigation";

export const TripsPage = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrips()
      .then(setTrips)
      .catch((error) => {
        toast.error(error.response?.data?.message || "Не удалось загрузить поездки");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleTripClick = (tripId: number) => {
    setActiveTripId(tripId);
    navigate(`/trip/${tripId}/timeline`);
  };

  const deleteTrip = async (tripId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Вы действительно хотите удалить поездку?")) return;

    try {
      await deleteTripRequest(tripId);
      setTrips((prev) => prev.filter((trip) => trip.id !== tripId));
      toast.success("Поездка удалена");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Не удалось удалить поездку");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/images/trips.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="relative z-10 flex min-h-screen flex-col">
        <ScreenHeader
          title="Мои поездки"
          left={
            <button
              type="button"
              onClick={() => navigate("/quick-access")}
              className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black text-2xl text-black"
            >
              ☰
            </button>
          }
        />

        <div className="flex-1 px-4 py-4 pb-32 sm:px-6">
          <button
            onClick={() => navigate("/add-trip")}
            className="mb-6 w-full rounded-xl bg-black/80 py-3 font-semibold text-white transition backdrop-blur-sm hover:bg-black/90"
          >
            + Добавить поездку
          </button>

          {trips.length === 0 ? (
            <div className="mb-6 rounded-xl border border-gray/70 bg-white/70 p-6 shadow-md backdrop-blur-sm">
              <p className="text-center font-medium text-gray-800">
                Пока нет ни одной поездки. Добавьте первую!
              </p>
            </div>
          ) : (
            trips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => handleTripClick(trip.id)}
                className="mb-6 cursor-pointer rounded-xl border border-gray-100 bg-gray-100/50 p-4 transition backdrop-blur-sm hover:bg-gray-100/60"
              >
                <h2 className="mb-2 text-lg font-bold">
                  {trip.status === "active" ? "Текущая поездка" : "Завершенная поездка"}
                </h2>
                <p className="mb-1 break-words text-black">🌍 {trip.title}</p>
                <p className="mb-1 text-black">
                  📅 {new Date(trip.startDate).toLocaleDateString()} —{" "}
                  {new Date(trip.endDate).toLocaleDateString()}
                </p>
                <button
                  onClick={(e) => deleteTrip(trip.id, e)}
                  className="mt-2 font-medium text-red-600 hover:text-red-800"
                >
                  🗑️ Удалить
                </button>
              </div>
            ))
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  );
};