import { useEffect, useRef, useState } from 'react';

export function useWebSocket(tripId: string | null, onMessage: (data: any) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!tripId) return;

    const userId = localStorage.getItem('userId');
    if (!userId) return;

    // Динамическое определение хоста для работы и с пк, и с телефона
    const host = window.location.hostname;
    const ws = new WebSocket(`ws://${host}:5000/ws?tripId=${tripId}&userId=${userId}`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onerror = () => setIsConnected(false);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        console.error('Ошибка парсинга WebSocket сообщения', e);
      }
    };

    return () => {
      ws.close();
    };
  }, [tripId]);

  return { isConnected };
}