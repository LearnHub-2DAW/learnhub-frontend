import api from './axios';

export const getMe = () => api.get('/usuarios/me');

export const updatePerfil = (datos) => api.put('/usuarios/me', datos);

export const changePassword = (datos) => api.put('/usuarios/me/contrasena', datos);

export const updatePreferenciasCalendario = (datos) =>
  api.put('/usuarios/me/preferencias-calendario', datos);

export const updatePreferenciasNotificaciones = (datos) =>
  api.put('/usuarios/me/preferencias-notificaciones', datos);

export const getMisModulos = () => api.get('/usuarios/me/modulos');
export const getMisEntregas = () => api.get('/usuarios/me/entregas');

export const getConversacion = (id) => api.get(`/mensajes/${id}`);

export const getUsuarios = () => api.get('/usuarios');
export const deleteUsuarioAdmin = (id) => api.delete(`/usuarios/${id}`);
export const changeRolUsuario = (id, rol) => api.put(`/usuarios/${id}/rol`, { rol });
