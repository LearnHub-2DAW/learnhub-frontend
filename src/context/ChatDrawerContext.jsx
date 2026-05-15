import { createContext, useContext, useState } from 'react';

const ChatDrawerContext = createContext(null);

export const ChatDrawerProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null); // { id, nombre_usuario }

  const toggle = () => setIsOpen(o => !o);
  const close = () => { setIsOpen(false); setActiveChat(null); };

  const openChat = (id, nombre_usuario) => {
    setActiveChat({ id: Number(id), nombre_usuario });
    setIsOpen(true);
  };

  const closeChat = () => setActiveChat(null);

  return (
    <ChatDrawerContext.Provider value={{ isOpen, toggle, close, activeChat, openChat, closeChat }}>
      {children}
    </ChatDrawerContext.Provider>
  );
};

export const useChatDrawer = () => useContext(ChatDrawerContext);
