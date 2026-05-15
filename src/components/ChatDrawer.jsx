import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useChatDrawer } from '../context/ChatDrawerContext';
import { getConversacion, buscarUsuarios } from '../api/usuario.api';
import './ChatDrawer.css';

const RECENT_KEY = 'lh_recent_chats';

const getRecents = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
  catch { return []; }
};

const saveRecent = ({ id, nombre_usuario }) => {
  const list = getRecents().filter(r => r.id !== id);
  localStorage.setItem(RECENT_KEY, JSON.stringify([{ id, nombre_usuario }, ...list].slice(0, 30)));
};

const ChatDrawer = () => {
  const { isOpen, close, activeChat, openChat, closeChat } = useChatDrawer();
  const { user } = useAuth();
  const { socket, usuariosOnline, noLeidos, marcarLeido, setReadingId } = useSocket();

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState(null); // null = not searching
  const [searchLoading, setSearchLoading] = useState(false);
  const [recents, setRecents] = useState(getRecents);
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const searchTimer = useRef(null);

  // Debounced search
  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!search.trim()) { setSearchResults(null); return; }
    setSearchLoading(true);
    searchTimer.current = setTimeout(() => {
      buscarUsuarios(search.trim())
        .then(res => setSearchResults(res.data))
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  // Notify SocketContext which conversation is open so chat:no_leidos is filtered
  useEffect(() => {
    setReadingId(isOpen && activeChat ? activeChat.id : null);
  }, [activeChat?.id, isOpen]);

  // Load conversation history when activeChat changes
  useEffect(() => {
    if (!activeChat) return;
    setLoading(true);
    setMensajes([]);
    getConversacion(activeChat.id)
      .then(res => setMensajes(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
    saveRecent({ id: activeChat.id, nombre_usuario: activeChat.nombre_usuario });
    setRecents(getRecents());
    marcarLeido(activeChat.id);
  }, [activeChat?.id]);

  // Real-time socket messages
  useEffect(() => {
    if (!socket || !user) return;
    const handler = (msg) => {
      const otherId = msg.id_emisor === user.id ? msg.id_receptor : msg.id_emisor;
      const otherName = msg.id_emisor !== user.id ? msg.nombre_usuario : null;
      if (otherName) {
        saveRecent({ id: otherId, nombre_usuario: otherName });
        setRecents(getRecents());
      }
      if (!activeChat) return;
      const mio = msg.id_emisor === user.id && msg.id_receptor === activeChat.id;
      const suyo = msg.id_emisor === activeChat.id && msg.id_receptor === user.id;
      if (mio || suyo) {
        setMensajes(prev => [...prev, msg]);
        if (suyo) marcarLeido(activeChat.id);
      }
    };
    socket.on('chat:mensaje', handler);
    return () => socket.off('chat:mensaje', handler);
  }, [socket, activeChat?.id, user?.id]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  // Focus input when chat opens
  useEffect(() => {
    if (activeChat) setTimeout(() => inputRef.current?.focus(), 50);
  }, [activeChat?.id]);

  const enviar = () => {
    if (!texto.trim() || !socket || !activeChat) return;
    socket.emit('chat:enviar', { id_receptor: activeChat.id, contenido: texto.trim() });
    setTexto('');
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); }
  };

  const formatHora = (fecha) =>
    new Date(fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const onlineIds = new Set(usuariosOnline.map(u => u.id));
  const filteredRecents = recents.filter(r => !onlineIds.has(r.id));
  const isSearching = search.trim().length > 0;

  const unreadFor = (id) =>
    noLeidos.conversaciones.find(c => c.id_emisor === id)?.total || 0;

  if (!isOpen) return null;

  return (
    <>
      <div className="cd-overlay" onClick={close} />
      <div className="cd-panel">

        {!activeChat ? (
          <>
            <div className="cd-header">
              <span className="cd-title">Mensajes</span>
              <button className="cd-close-btn" onClick={close}>✕</button>
            </div>

            <div className="cd-search-wrap">
              <input
                className="cd-search"
                placeholder="Buscar persona..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className="cd-list">
              {isSearching ? (
                searchLoading ? (
                  <p className="cd-empty">Buscando...</p>
                ) : searchResults?.length === 0 ? (
                  <p className="cd-empty">Sin resultados</p>
                ) : (
                  <div className="cd-section">
                    <div className="cd-section-title">RESULTADOS</div>
                    {searchResults?.map(u => (
                      <button key={u.id} className="cd-contact-row" onClick={() => { openChat(u.id, u.nombre_usuario); setSearch(''); }}>
                        <div className="cd-avatar-wrap">
                          <span className="cd-avatar">{u.nombre_usuario[0]?.toUpperCase()}</span>
                          {onlineIds.has(u.id) && <span className="cd-status-dot" />}
                        </div>
                        <div className="cd-contact-info">
                          <span className="cd-contact-name">{u.nombre_usuario}</span>
                          {(u.nombre || u.apellidos) && (
                            <span className="cd-contact-sub">{u.nombre} {u.apellidos}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <>
                  {usuariosOnline.length > 0 && (
                    <div className="cd-section">
                      <div className="cd-section-title">EN LÍNEA ({usuariosOnline.length})</div>
                      {usuariosOnline.map(u => {
                        const unread = unreadFor(u.id);
                        return (
                          <button key={u.id} className="cd-contact-row" onClick={() => openChat(u.id, u.nombre_usuario)}>
                            <div className="cd-avatar-wrap">
                              <span className="cd-avatar">{u.nombre_usuario[0]?.toUpperCase()}</span>
                              <span className="cd-status-dot" />
                            </div>
                            <span className="cd-contact-name">{u.nombre_usuario}</span>
                            {unread > 0 && <span className="cd-unread-badge">{unread}</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {filteredRecents.length > 0 && (
                    <div className="cd-section">
                      <div className="cd-section-title">RECIENTES</div>
                      {filteredRecents.map(r => {
                        const unread = unreadFor(r.id);
                        return (
                          <button key={r.id} className="cd-contact-row" onClick={() => openChat(r.id, r.nombre_usuario)}>
                            <div className="cd-avatar-wrap">
                              <span className="cd-avatar">{r.nombre_usuario[0]?.toUpperCase()}</span>
                            </div>
                            <span className="cd-contact-name">{r.nombre_usuario}</span>
                            {unread > 0 && <span className="cd-unread-badge">{unread}</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {usuariosOnline.length === 0 && filteredRecents.length === 0 && (
                    <p className="cd-empty">Nadie en línea todavía</p>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="cd-header">
              <button className="cd-back-btn" onClick={closeChat}>←</button>
              <span className="cd-avatar sm">{activeChat.nombre_usuario[0]?.toUpperCase()}</span>
              <span className="cd-header-name">{activeChat.nombre_usuario}</span>
              <button className="cd-close-btn" onClick={close}>✕</button>
            </div>

            <div className="cd-messages">
              {loading ? (
                <p className="cd-msg-empty">Cargando...</p>
              ) : mensajes.length === 0 ? (
                <p className="cd-msg-empty">Aún no hay mensajes. ¡Di hola!</p>
              ) : (
                mensajes.map((m, i) => {
                  const esMio = m.id_emisor === user.id;
                  return (
                    <div key={i} className={`cd-bubble-wrap ${esMio ? 'mine' : 'theirs'}`}>
                      <div className={`cd-bubble ${esMio ? 'mine' : 'theirs'}`}>
                        <p className="cd-bubble-text">{m.contenido}</p>
                        <span className="cd-bubble-time">{formatHora(m.fecha_envio)}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <div className="cd-input-row">
              <textarea
                ref={inputRef}
                className="cd-input"
                placeholder="Escribe un mensaje..."
                value={texto}
                onChange={e => setTexto(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
              />
              <button className="cd-send-btn" onClick={enviar} disabled={!texto.trim() || !socket}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                </svg>
              </button>
            </div>
          </>
        )}

      </div>
    </>
  );
};

export default ChatDrawer;
