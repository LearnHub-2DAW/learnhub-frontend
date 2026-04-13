import axios from 'axios';

const api = axios.create({
  // Esto lee 'http://localhost:3000/api' de tu .env
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Interceptor para enviar el token automáticamente en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;