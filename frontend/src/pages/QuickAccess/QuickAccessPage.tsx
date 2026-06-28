import { useNavigate } from 'react-router-dom';

export const QuickAccessPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <button onClick={() => navigate(-1)} className="text-blue-500 mb-4">← Назад</button>
            <h1 className="text-2xl font-bold mb-4">Документы</h1>
            <div className="space-y-4">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-semibold">✈️ Трансфер</h2>
                    <p className="text-gray-500">Билеты на самолёт, поезд, автобус</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-semibold">🏨 Проживание</h2>
                    <p className="text-gray-500">Брони отелей, хостелов</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-semibold">🎫 События</h2>
                    <p className="text-gray-500">Билеты на мероприятия, экскурсии</p>
                </div>
            </div>
        </div>
    );
};