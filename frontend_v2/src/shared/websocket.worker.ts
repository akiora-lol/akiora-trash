/// <reference lib="webworker" />

declare const self: SharedWorkerGlobalScope;

import ReconnectingWebSocket from 'reconnecting-websocket';

// Типы сообщений между вкладками и воркером
interface WorkerMessage {
    type: 'CONNECT' | 'SEND_MESSAGE' | 'DISCONNECT';
    payload?: {
        userId?: string | null;
        message?: string;
    };
}

// Состояние воркера
let socket: ReconnectingWebSocket | null = null;
let currentUserId: string | null = null;
const ports: MessagePort[] = [];

// Функция для создания URL вебсокета
const getWebSocketUrl = (userId: string | null): string => {
    const baseUrl = 'ws://localhost:3001'; // Замените на ваш URL
    return userId ? `${baseUrl}/ws/${userId}` : `${baseUrl}/ws`;
};

// Функция для создания или пересоздания соединения
const createOrReconnectSocket = (userId: string | null) => {
    console.log(`[Worker] Creating socket for user: ${userId || 'anonymous'}`);

    // Закрываем старое соединение если есть
    if (socket) {
        console.log('[Worker] Closing existing socket');
        socket.close();
    }

    const url = getWebSocketUrl(userId);
    console.log('[Worker] Connecting to:', url);

    socket = new ReconnectingWebSocket(url, [], {
        connectionTimeout: 4000,
        maxRetries: 10,
        maxReconnectionDelay: 30000,
        minReconnectionDelay: 2000,
    });

    socket.onopen = () => {
        console.log(`[Worker] WebSocket connected for user: ${userId || 'anonymous'}`);
        // Уведомляем все вкладки о подключении
        ports.forEach(port => {
            port.postMessage({
                type: 'CONNECTED',
                payload: { userId }
            });
        });
    };

    socket.onmessage = (event) => {
        console.log('[Worker] Received message:', event.data);
        // Получили сообщение от сервера - шлем во все вкладки
        ports.forEach(port => {
            port.postMessage({
                type: 'MESSAGE',
                payload: { data: event.data }
            });
        });
    };

    socket.onclose = () => {
        console.log('[Worker] WebSocket closed');
        ports.forEach(port => {
            port.postMessage({ type: 'DISCONNECTED' });
        });
    };

    socket.onerror = (error) => {
        console.error('[Worker] WebSocket error:', error);
        ports.forEach(port => {
            port.postMessage({
                type: 'ERROR',
                payload: { error: 'Connection error' }
            });
        });
    };
};

// Обработка подключения новой вкладки
self.onconnect = (e: MessageEvent) => {
    console.log('[Worker] New tab connected');
    const port = e.ports[0];
    ports.push(port);

    port.onmessage = (event: MessageEvent<WorkerMessage>) => {
        const { type, payload } = event.data;
        console.log('[Worker] Received message from tab:', type, payload);

        switch (type) {
            case 'CONNECT':
                console.log('[Worker] CONNECT request with userId:', payload?.userId);
                // Если userId изменился, пересоздаем соединение
                if (currentUserId !== payload?.userId) {
                    currentUserId = payload?.userId || null;
                    createOrReconnectSocket(currentUserId);
                } else {
                    console.log('[Worker] User ID unchanged, keeping existing connection');
                    // Если соединение уже есть, просто уведомляем новую вкладку
                    if (socket) {
                        port.postMessage({
                            type: 'CONNECTED',
                            payload: { userId: currentUserId }
                        });
                    }
                }
                break;

            case 'SEND_MESSAGE':
                console.log('[Worker] SEND_MESSAGE:', payload?.message);
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(payload?.message || '');
                    console.log('[Worker] Message sent');
                } else {
                    console.warn('[Worker] Cannot send message: socket not ready');
                }
                break;

            case 'DISCONNECT':
                console.log('[Worker] DISCONNECT request');
                if (socket) {
                    socket.close();
                    socket = null;
                    currentUserId = null;
                }
                break;

            default:
                console.warn('[Worker] Unknown message type:', type);
        }
    };

    port.start();

    // Если соединение уже есть, сообщаем новой вкладке текущий статус
    if (socket) {
        console.log('[Worker] Notifying new tab about existing connection');
        port.postMessage({
            type: 'CONNECTED',
            payload: { userId: currentUserId }
        });
    }
};

// Чтобы файл считался модулем
export { };
