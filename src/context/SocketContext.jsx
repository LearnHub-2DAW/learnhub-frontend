import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getNoLeidos, leerConversacion } from '../api/usuario.api';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api$/, '');

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [usuariosOnline, setUsuariosOnline] = useState([]);
  const [noLeidos, setNoLeidos] = useState({ total: 0, conversaciones: [] });
  const readingIdRef = useRef(null);

  useEffect(() => {
    if (!user) {
      setSocket(prev => { prev?.disconnect(); return null; });
      setUsuariosOnline([]);
      setNoLeidos({ total: 0, conversaciones: [] });
      return;
    }

    const token = localStorage.getItem('token');
    const s = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: 5,
    });

    s.on('connect', () => {
      getNoLeidos().then(res => setNoLeidos(res.data)).catch(() => {});
    });

    s.on('usuarios:online', (users) => {
      setUsuariosOnline(users.filter(u => u.id !== user.id));
    });

    s.on('chat:no_leidos', (data) => {
      if (readingIdRef.current !== null) {
        const convs = data.conversaciones.filter(c => c.id_emisor !== readingIdRef.current);
        const total = convs.reduce((s, c) => s + Number(c.total), 0);
        setNoLeidos({ total, conversaciones: convs });
      } else {
        setNoLeidos(data);
      }
    });

    s.on('connect_error', (err) => {
      console.error('Socket connect_error:', err.message);
    });

    setSocket(s);

    return () => { s.disconnect(); };
  }, [user?.id]);

  const marcarLeido = (idEmisor) => {
    setNoLeidos(prev => {
      const convs = prev.conversaciones.filter(c => c.id_emisor !== idEmisor);
      const total = convs.reduce((s, c) => s + Number(c.total), 0);
      return { total, conversaciones: convs };
    });
    leerConversacion(idEmisor).catch(() => {});
  };

  const setReadingId = (id) => { readingIdRef.current = id; };

  return (
    <SocketContext.Provider value={{ socket, usuariosOnline, noLeidos, marcarLeido, setReadingId }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
