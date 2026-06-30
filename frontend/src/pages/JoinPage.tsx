import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { acceptInvitation } from '../api/invitation';
import toast from 'react-hot-toast';

export const JoinPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(true);
  const called = useRef(false);

  useEffect(() => {
    if (!token) {
      toast.error('Неверная ссылка');
      navigate('/trips');
      return;
    }

    if (called.current) return;
    called.current = true;

    acceptInvitation(token)
      .then((tripId) => {
        toast.success('Вы присоединились к поездке!');
        navigate(`/trip/${tripId}/timeline`);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Ошибка принятия приглашения');
        navigate('/trips');
      })
      .finally(() => setLoading(false));
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {loading ? 'Присоединение...' : 'Готово'}
    </div>
  );
};