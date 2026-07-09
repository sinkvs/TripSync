import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { acceptInvitation } from '../api/invitation';
import toast from 'react-hot-toast';
import { setActiveTripId } from '../utils/tripNavigation';

export const JoinPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(true);
  // Флаг для защиты от повторного вызова
  const called = useRef(false);

  useEffect(() => {
    // Проверка наличия токена
    if (!token) {
      toast.error('Неверная ссылка');
      navigate('/trips');
      return;
    }

    if (called.current) return;
    called.current = true;

    // Принятие приглашения
    acceptInvitation(token)
      .then((tripId) => {
        setActiveTripId(tripId);
        toast.success('Вы присоединились к поездке!');
        navigate(`/trip/${tripId}/timeline`);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Ошибка принятия приглашения');
        navigate('/trips');
      })
      .finally(() => setLoading(false));
  }, [token, navigate]);

  // Экран загрузки/завершения
  return (
    <div className="min-h-screen flex items-center justify-center">
      {loading ? 'Присоединение...' : 'Готово'}
    </div>
  );
};