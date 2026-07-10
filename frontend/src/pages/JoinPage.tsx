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
  const called = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!token) {
      toast.error('Неверная ссылка');
      navigate('/trips');
      return;
    }

    if (called.current) return;
    called.current = true;

    abortControllerRef.current = new AbortController();

    acceptInvitation(token)
      .then((tripId) => {
        setActiveTripId(tripId);
        toast.success('Вы присоединились к поездке!');
        navigate(`/trip/${tripId}/timeline`);
      })
      .catch((err) => {
        const message = err.response?.data?.message || '';

        // Если пользователь уже участник — перенаправляем без ошибки
        if (
          message.includes('уже является участником') ||
          message.includes('already a member') ||
          message.includes('already joined')
        ) {
          // Попробуем получить tripId из ответа (если бэкенд его вернул)
          const tripId = err.response?.data?.tripId;
          if (tripId) {
            setActiveTripId(tripId);
            navigate(`/trip/${tripId}/timeline`);
          } else {
            navigate('/trips');
          }
          return;
        }

        // Остальные ошибки показываем
        toast.error(message || 'Ошибка принятия приглашения');
        navigate('/trips');
      })
      .finally(() => {
        setLoading(false);
        abortControllerRef.current = null;
      });

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {loading ? 'Присоединение...' : 'Готово'}
    </div>
  );
};