import api from './axios';

export const getCursos = () => api.get('/cursos');
export const getCursoById = (id) => api.get(`/cursos/${id}`);
export const getModulosByCurso = (id) => api.get(`/cursos/${id}/modulos`);
export const getModuloById = (id) => api.get(`/modulos/${id}`);
export const getRecursosByModulo = (id) => api.get(`/modulos/${id}/recursos`);
export const getRecursoById = (id) => api.get(`/recursos/${id}`);

export const createCurso = (data) => api.post('/cursos', data);
export const updateCurso = (id, data) => api.put(`/cursos/${id}`, data);
export const deleteCurso = (id) => api.delete(`/cursos/${id}`);

export const createModulo = (data) => api.post('/modulos', data);
export const updateModulo = (id, data) => api.put(`/modulos/${id}`, data);
export const deleteModulo = (id) => api.delete(`/modulos/${id}`);

export const createRecurso = (formData) => api.post('/recursos', formData);
export const updateRecurso = (id, formData) => api.put(`/recursos/${id}`, formData);
export const deleteRecurso = (id) => api.delete(`/recursos/${id}`);
