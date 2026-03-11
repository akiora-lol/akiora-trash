import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import ReconnectingWebSocket from 'reconnecting-websocket';

interface WebSocketContextType {
    isConnected: boolean;
    lastMessage: string | null;
    error: string | null;
    sendMessage: (message: string) => void;
    disconnect: () => void;
    reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const socketRef = useRef<ReconnectingWebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NOdeJs.Timeout>();

    // Функция для получения URL в зависимости от пользователя
    const getWebSocketUrl = useCallback((): string => {
        const baseUrl = 'ws://localhost:8005'; // Замените на ваш URL
        return user?.id ? `${baseUrl}/ws/${user.id}` : `${baseUrl}/ws`;
    }, [user?.id]);

    // Функция подключения
    const connect = useCallback(() => {
        // Закрываем существующее соединение
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }

        const url = getWebSocketUrl();
        console.log('[WebSocket] Connecting to:', url);

        try {
            // Создаем новое соединение с auto reconnect
            socketRef.current = new ReconnectingWebSocket(url, [], {
                connectionTimeout: 4000,
                maxRetries: 10,
                maxReconnectionDelay: 30000,
                minReconnectionDelay: 2000,
            });

            socketRef.current.onopen = () => {
                console.log('[WebSocket] Connected successfully');
                setIsConnected(true);
                setError(null);
            };

            socketRef.current.onmessage = (event) => {
                console.log('[WebSocket] Message received:', event.data);
                setLastMessage(event.data);
            };

            socketRef.current.onclose = () => {
                console.log('[WebSocket] Connection closed');
                setIsConnected(false);
            };

            socketRef.current.onerror = (event) => {
                console.error('[WebSocket] Error:', event);
                setError('WebSocket connection error');
                setIsConnected(false);
            };

        } catch (err) {
            console.error('[WebSocket] Failed to create connection:', err);
            setError('Failed to create WebSocket connection');
            setIsConnected(false);
        }
    }, [getWebSocketUrl]);

    // Функция отключения
    const disconnect = useCallback(() => {
        console.log('[WebSocket] Manual disconnect');
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
        setIsConnected(false);
    }, []);

    // Функция переподключения
    const reconnect = useCallback(() => {
        console.log('[WebSocket] Manual reconnect');
        connect();
    }, [connect]);

    // Функция отправки сообщения
    const sendMessage = useCallback((message: string) => {
        if (!socketRef.current) {
            console.warn('[WebSocket] Cannot send message: no connection');
            setError('No WebSocket connection');
            return;
        }

        if (socketRef.current.readyState !== WebSocket.OPEN) {
            console.warn('[WebSocket] Cannot send message: connection not open', {
                readyState: socketRef.current.readyState
            });
            setError('WebSocket is not connected');
            return;
        }

        try {
            console.log('[WebSocket] Sending message:', message);
            socketRef.current.send(message);
        } catch (err) {
            console.error('[WebSocket] Error sending message:', err);
            setError('Failed to send message');
        }
    }, []);

    // Подключаемся при монтировании и при изменении user
    useEffect(() => {
        console.log('[WebSocket] User changed, reconnecting...', user?.id || 'anonymous');

        // Небольшая задержка чтобы избежать множественных переподключений
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(() => {
            connect();
        }, 100);

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            disconnect();
        };
    }, [user?.id, connect, disconnect]);

    return (
        <WebSocketContext.Provider value={{
            isConnected,
            lastMessage,
            error,
            sendMessage,
            disconnect,
            reconnect
        }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within SimpleWebSocketProvider');
    }
    return context;
};
