import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app, verificar si hay un token guardado
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (nombre_usuario, contrasena) => {
    // Llamada al endpoint definido en auth.routes.js
    const res = await api.post('/auth/login', { nombre_usuario, contrasena });
    
    // Se guardan los datos que devuelve tu controller
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.usuario));
    
    setUser(res.data.usuario);
    return res.data;
  };

  const register = async (datos) => {
    // Llamada al register del controller
    const res = await api.post('/auth/register', datos);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);