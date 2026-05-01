import api from './axios';

export const getCursos = () => api.get('/cursos');
export const getCursoById = (id) => api.get(`/cursos/${id}`);
export const getModulosByCurso = (id) => api.get(`/cursos/${id}/modulos`);
export const getModuloById = (id) => api.get(`/modulos/${id}`);
export const getRecursosByModulo = (id) => api.get(`/modulos/${id}/recursos`);
export const getRecursoById = (id) => api.get(`/recursos/${id}`);
