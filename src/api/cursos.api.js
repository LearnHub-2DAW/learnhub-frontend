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
export const enrollModulo = (id) => api.post(`/modulos/${id}/enroll`, {});
export const unenrollModulo = (id) => api.delete(`/modulos/${id}/enroll`);
export const enrollUsuario = (id_modulo, id_usuario) => api.post(`/modulos/${id_modulo}/enroll`, { id_usuario });
export const unenrollUsuario = (id_modulo, id_usuario) => api.delete(`/modulos/${id_modulo}/enroll`, { data: { id_usuario } });
export const getEnrolledUsers = (id) => api.get(`/modulos/${id}/usuarios`);

export const createRecurso = (formData) => api.post('/recursos', formData);
export const updateRecurso = (id, formData) => api.put(`/recursos/${id}`, formData);
export const deleteRecurso = (id) => api.delete(`/recursos/${id}`);
export const submitEntrega = (id, formData) => api.post(`/recursos/${id}/entregar`, formData);
export const getMyEntrega = (id) => api.get(`/recursos/${id}/entrega`);
export const getEntregas = (id) => api.get(`/recursos/${id}/entregas`);
export const calificarEntrega = (id_recurso, id_usuario, calificacion) =>
  api.put(`/recursos/${id_recurso}/entregas/${id_usuario}/calificar`, { calificacion });
