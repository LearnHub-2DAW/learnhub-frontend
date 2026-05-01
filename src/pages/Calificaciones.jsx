import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCursoById } from '../api/cursos.api';
import './Calificaciones.css';

const Calificaciones = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  // Cuando el backend tenga el endpoint se rellenará este array
  const [calificaciones] = useState([]);

  useEffect(() => {
    getCursoById(id)
      .then(res => setCurso(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-loading">Cargando...</div>;

  return (
    <div className="calificaciones-page">
      <div className="page-card">

        {/* Cabecera del curso */}
        <div className="page-card-header">
          <h1 className="page-title">{curso?.nombre || 'Título Del Curso'}</h1>
          <p className="page-breadcrumb">
            <Link to="/dashboard">Inicio</Link>
            <span> / </span>
            <Link to={`/curso/${id}`}>{curso?.nombre || 'Curso'}</Link>
            <span> / </span>
            <span>Calificaciones</span>
          </p>
        </div>

        {/* Tabla de calificaciones */}
        <div className="grades-body">
          <div className="grades-username">
            {user ? `${user.nombre} ${user.apellidos}` : 'Nombre de Usuario'}
          </div>

          <table className="grades-table">
            <thead>
              <tr>
                <th>Ítem de Calificación</th>
                <th>Ponderación Calculada</th>
                <th>Calificación</th>
                <th>Porcentaje</th>
                <th>Aportación al Curso</th>
              </tr>
            </thead>
            <tbody>
              {calificaciones.length === 0 ? (
                <tr>
                  <td colSpan={5} className="no-data">
                    No hay calificaciones disponibles
                  </td>
                </tr>
              ) : (
                calificaciones.map((item, i) => (
                  <tr key={i}>
                    <td>{item.nombre}</td>
                    <td>{item.ponderacion}</td>
                    <td>{item.calificacion}</td>
                    <td>{item.porcentaje}%</td>
                    <td>{item.aportacion}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Calificaciones;
