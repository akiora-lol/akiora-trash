import { useWebSocket } from '../contexts/WebSocketContext';

export const useWebSocketMessage = () => {
    const { lastMessage, sendMessage, isConnected, error } = useWebSocket();

    return {
        lastMessage,
        sendMessage,
        isConnected,
        error
    };
};
