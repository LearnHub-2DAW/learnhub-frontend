import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Base del servidor sin el prefijo /api — para URLs de archivos estáticos
const serverBase = (import.meta.env.VITE_API_URL || 'http://localhost:3000')
  .replace(/\/api$/, '');

export const getFileUrl = (ruta) => {
  if (!ruta) return null;
  // Normaliza separadores de Windows (\) a URL (/)
  return `${serverBase}/${ruta.replace(/\\/g, '/')}`;
};

// Interceptor para enviar el token automáticamente en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;