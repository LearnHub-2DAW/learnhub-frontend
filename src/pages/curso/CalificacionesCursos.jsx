import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCursos } from '../../api/cursos.api';
import { useLang } from '../../context/LangContext';
import PerfilHeader from '../../components/PerfilHeader';
import './CalificacionesCursos.css';

const CalificacionesCursos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tr } = useLang();
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

      <div className="cc-section">
        <h3 className="cc-section-title">{tr('cc_currentCourses')}</h3>
        <div className="cc-table-wrapper">
          {loading ? (
            <p className="cc-empty">{tr('loading')}</p>
          ) : cursosAlumno.length === 0 ? (
            <p className="cc-empty">{tr('cc_noCourses')}</p>
          ) : (
            <table className="cc-table">
              <thead>
                <tr>
                  <th>{tr('cc_courseName')}</th>
                  <th>{tr('h_grades')}</th>
                </tr>
              </thead>
              <tbody>
                {cursosAlumno.map(c => (
                  <tr key={c.id}>
                    <td className="cc-curso-link" onClick={() => navigate(`/curso/${c.id}`)}>
                      {c.nombre}
                    </td>
                    <td>
                      <button className="cc-btn" onClick={() => navigate(`/curso/${c.id}/calificaciones`)}>
                        {tr('cc_gradingTable')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {cursosProfesor.length > 0 && (
        <div className="cc-section">
          <h3 className="cc-section-title">{tr('cc_teachingCourses')}</h3>
          <div className="cc-table-wrapper">
            <table className="cc-table">
              <thead>
                <tr>
                  <th>{tr('cc_courseName')}</th>
                  <th>{tr('h_grades')}</th>
                </tr>
              </thead>
              <tbody>
                {cursosProfesor.map(c => (
                  <tr key={c.id}>
                    <td className="cc-curso-link" onClick={() => navigate(`/curso/${c.id}`)}>
                      {c.nombre}
                    </td>
                    <td>
                      <button className="cc-btn" onClick={() => navigate(`/curso/${c.id}/calificaciones`)}>
                        {tr('cc_gradingTable')}
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
