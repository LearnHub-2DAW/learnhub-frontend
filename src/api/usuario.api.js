import api from './axios';

export const getMe = () => api.get('/usuarios/me');

export const updatePerfil = (datos) => api.put('/usuarios/me', datos);

export const changePassword = (datos) => api.put('/usuarios/me/contrasena', datos);


export const getMisModulos = () => api.get('/usuarios/me/modulos');
export const getMisEntregas = () => api.get('/usuarios/me/entregas');

export const getConversacion = (id) => api.get(`/mensajes/${id}`);
export const getNoLeidos = () => api.get('/mensajes/no-leidos');
export const leerConversacion = (id) => api.put(`/mensajes/${id}/leer`);

export const buscarUsuarios = (q) => api.get('/usuarios/buscar', { params: q ? { q } : {} });

export const getUsuarios = () => api.get('/usuarios');
export const getUsuarioById = (id) => api.get(`/usuarios/${id}`);
export const updateUsuarioAdmin = (id, datos) => api.put(`/usuarios/${id}`, datos);
export const deleteUsuarioAdmin = (id) => api.delete(`/usuarios/${id}`);
export const changeRolUsuario = (id, rol) => api.put(`/usuarios/${id}/rol`, { rol });
export const getModulosDeUsuario = (id) => api.get(`/usuarios/${id}/modulos`);
