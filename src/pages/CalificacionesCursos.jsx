import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCursos } from '../api/cursos.api';
import PerfilHeader from '../components/PerfilHeader';
import './CalificacionesCursos.css';

const CalificacionesCursos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCursos()
      .then(res => setCursos(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cursosAlumno = cursos;
  const cursosProfesor = user?.roles?.includes('profesor') || user?.roles?.includes('admin')
    ? cursos
    : [];

  return (
    <div className="cal-cursos-page">
      <PerfilHeader />

      {/* Cursos actuales */}
      <div className="cc-section">
        <h3 className="cc-section-title">Cursos actuales</h3>
        <div className="cc-table-wrapper">
          {loading ? (
            <p className="cc-empty">Cargando cursos...</p>
          ) : cursosAlumno.length === 0 ? (
            <p className="cc-empty">No hay cursos disponibles</p>
          ) : (
            <table className="cc-table">
              <thead>
                <tr>
                  <th>Nombre del Curso</th>
                  <th>Calificaciones</th>
                </tr>
              </thead>
              <tbody>
                {cursosAlumno.map(c => (
                  <tr key={c.id}>
                    <td
                      className="cc-curso-link"
                      onClick={() => navigate(`/curso/${c.id}`)}
                    >
                      {c.nombre}
                    </td>
                    <td>
                      <button
                        className="cc-btn"
                        onClick={() => navigate(`/curso/${c.id}/calificaciones`)}
                      >
                        Tabla de Cursos
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Cursos que estoy enseñando */}
      {cursosProfesor.length > 0 && (
        <div className="cc-section">
          <h3 className="cc-section-title">Cursos que estoy enseñando</h3>
          <div className="cc-table-wrapper">
            <table className="cc-table">
              <thead>
                <tr>
                  <th>Nombre del Curso</th>
                  <th>Calificaciones</th>
                </tr>
              </thead>
              <tbody>
                {cursosProfesor.map(c => (
                  <tr key={c.id}>
                    <td
                      className="cc-curso-link"
                      onClick={() => navigate(`/curso/${c.id}`)}
                    >
                      {c.nombre}
                    </td>
                    <td>
                      <button
                        className="cc-btn"
                        onClick={() => navigate(`/curso/${c.id}/calificaciones`)}
                      >
                        Tabla de Cursos
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalificacionesCursos;
