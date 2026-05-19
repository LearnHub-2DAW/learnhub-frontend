import api from './axios';

export const lanzarBoletinDiario = () => api.post('/notificaciones/boletines/diario');
export const lanzarBoletinSemanal = () => api.post('/notificaciones/boletines/semanal');
