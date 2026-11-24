import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

// In development, connect to localhost:5000. In production, connect to VITE_BACKEND_URL or Render backend.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [serverUrl] = useState(BACKEND_URL);

  useEffect(() => {
    const s = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      autoConnect: true
    });

    s.on('connect', () => {
      console.log(' Connected to Socket server:', s.id);
      setIsConnected(true);
    });

    s.on('disconnect', (reason) => {
      console.log(' Disconnected from Socket server:', reason);
      setIsConnected(false);
    });

    s.on('connect_error', (err) => {
      console.warn('Socket connection warning/error:', err.message);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, serverUrl }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

