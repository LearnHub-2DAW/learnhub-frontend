import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api$/, '');

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [usuariosOnline, setUsuariosOnline] = useState([]);

  useEffect(() => {
    if (!user) {
      setSocket(prev => { prev?.disconnect(); return null; });
      setUsuariosOnline([]);
      return;
    }

    const token = localStorage.getItem('token');
    const s = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: 5,
    });

    s.on('usuarios:online', (users) => {
      setUsuariosOnline(users.filter(u => u.id !== user.id));
    });

    s.on('connect_error', (err) => {
      console.error('Socket connect_error:', err.message);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket, usuariosOnline }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
