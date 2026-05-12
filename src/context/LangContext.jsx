import { createContext, useContext, useState, useCallback } from 'react';
import t from '../i18n/translations';

const LangContext = createContext(null);

export const LangProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => localStorage.getItem('lang') || 'es');

  const setLang = useCallback((code) => {
    localStorage.setItem('lang', code);
    setLangState(code);
  }, []);

  // Translation function: falls back to Spanish if key missing
  const tr = useCallback((key) => {
    return t[lang]?.[key] ?? t['es']?.[key] ?? key;
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, tr }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
