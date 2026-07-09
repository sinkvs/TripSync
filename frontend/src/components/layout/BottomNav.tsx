import { useLocation, useNavigate } from 'react-router-dom';
import { goToTimelineHome, getActiveTripId } from '../../utils/tripNavigation';

const baseButtonClassName = 'flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-1';
const labelClassName = 'text-[9px] leading-none text-gray-700';

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTripId = getActiveTripId();
  const isTimeline = /^\/trip\/\d+\/timeline$/.test(location.pathname);
  const isWeather = location.pathname === '/weather';
  const isMap = location.pathname === '/map';
  const isChat = location.pathname === '/chat' || location.pathname === '/chats';
  const isProfile = location.pathname === '/profile';

  const activeClassName = 'bg-black/80 text-white shadow-sm';
  const inactiveClassName = 'text-black';

  return (
    <div className="fixed bottom-4 left-0 right-0 z-20 flex justify-center pointer-events-none">
      <div className="pointer-events-auto w-full max-w-[430px] px-3">
        <nav className="grid grid-cols-5 items-end rounded-[28px] border border-white/20 bg-white/70 px-3 py-3 shadow-sm backdrop-blur-sm">
          <button
            type="button"
            onClick={() => goToTimelineHome(navigate, activeTripId)}
            className={`${baseButtonClassName} ${isTimeline ? activeClassName : inactiveClassName}`}
          >
            <span className="text-lg leading-none">🏠</span>
            <span className={isTimeline ? 'text-[9px] leading-none text-white' : labelClassName}>Главная</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/weather')}
            className={`${baseButtonClassName} ${isWeather ? activeClassName : inactiveClassName}`}
          >
            <img src="/icons/weather.png" alt="Погода" className="h-6 w-6" />
            <span className={isWeather ? 'text-[9px] leading-none text-white' : labelClassName}>Погода</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/map')}
            className={`${baseButtonClassName} ${isMap ? activeClassName : inactiveClassName}`}
          >
            <img src="/icons/map.png" alt="Карта" className="h-6 w-6" />
            <span className={isMap ? 'text-[9px] leading-none text-white' : labelClassName}>Карта</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/chats')}
            className={`${baseButtonClassName} ${isChat ? activeClassName : inactiveClassName}`}
          >
            <img src="/icons/chat.png" alt="Чат" className="h-6 w-6" />
            <span className={isChat ? 'text-[9px] leading-none text-white' : labelClassName}>Чат</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/profile')}
            className={`${baseButtonClassName} ${isProfile ? activeClassName : inactiveClassName}`}
          >
            <img src="/icons/profile.png" alt="Профиль" className="h-6 w-6" />
            <span className={isProfile ? 'text-[9px] leading-none text-white' : labelClassName}>Профиль</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
