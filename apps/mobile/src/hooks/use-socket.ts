import { useEffect, useRef, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export const useSocket = (namespace: string) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const connect = async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) return;

      socketRef.current = io(`${API_URL}/${namespace}`, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
      });
    };

    connect();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [namespace]);

  const emit = useCallback((event: string, data?: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback((event: string, handler: (...args: unknown[]) => void) => {
    socketRef.current?.on(event, handler);
    return () => {
      socketRef.current?.off(event, handler);
    };
  }, []);

  return { emit, on, socket: socketRef };
};
