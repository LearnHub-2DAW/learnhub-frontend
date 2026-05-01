import api from './axios';

export const getMe = () => api.get('/usuarios/me');

export const updatePerfil = (datos) => api.put('/usuarios/me', datos);

export const changePassword = (datos) => api.put('/usuarios/me/contrasena', datos);

export const updatePreferenciasCalendario = (datos) =>
  api.put('/usuarios/me/preferencias-calendario', datos);

export const updatePreferenciasNotificaciones = (datos) =>
  api.put('/usuarios/me/preferencias-notificaciones', datos);
