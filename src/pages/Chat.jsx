import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useLang } from '../context/LangContext';
import { getConversacion } from '../api/usuario.api';
import './Chat.css';

const Chat = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { tr } = useLang();

  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const otroNombre = state?.nombre_usuario
    || mensajes.find(m => m.id_emisor === Number(id))?.nombre_usuario
    || `Usuario ${id}`;

  useEffect(() => {
    setLoading(true);
    getConversacion(id)
      .then(res => setMensajes(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      const mio = msg.id_emisor === user.id && msg.id_receptor === Number(id);
      const suyo = msg.id_emisor === Number(id) && msg.id_receptor === user.id;
      if (mio || suyo) setMensajes(prev => [...prev, msg]);
    };
    socket.on('chat:mensaje', handler);
    return () => socket.off('chat:mensaje', handler);
  }, [socket, id, user.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const enviar = () => {
    if (!texto.trim() || !socket) return;
    socket.emit('chat:enviar', { id_receptor: Number(id), contenido: texto.trim() });
    setTexto('');
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  const formatHora = (fecha) =>
    new Date(fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="chat-page">
      <div className="chat-card">

        <div className="chat-header">
          <Link to="/dashboard" className="chat-back">←</Link>
          <div className="chat-header-info">
            <div className="chat-avatar">{otroNombre[0]?.toUpperCase()}</div>
            <div>
              <p className="chat-header-name">{otroNombre}</p>
              <p className="chat-header-status">{tr('chat_online')}</p>
            </div>
          </div>
        </div>

        <div className="chat-messages">
          {loading ? (
            <p className="chat-empty">{tr('loading')}</p>
          ) : mensajes.length === 0 ? (
            <p className="chat-empty">{tr('chat_noMessages')}</p>
          ) : (
            mensajes.map((m, i) => {
              const esMio = m.id_emisor === user.id;
              return (
                <div key={i} className={`chat-bubble-wrap ${esMio ? 'mine' : 'theirs'}`}>
                  <div className={`chat-bubble ${esMio ? 'mine' : 'theirs'}`}>
                    <p className="bubble-text">{m.contenido}</p>
                    <span className="bubble-time">{formatHora(m.fecha_envio)}</span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-row">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder={tr('chat_placeholder')}
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
          />
          <button
            className="chat-send-btn"
            onClick={enviar}
            disabled={!texto.trim() || !socket}
          >
            {tr('chat_send')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Chat;
