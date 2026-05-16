import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCursos, getModulosByCurso } from '../../api/cursos.api';
import { getMisModulos } from '../../api/usuario.api';
import { useLang } from '../../context/LangContext';
import PerfilHeader from '../../components/PerfilHeader';
import './CalificacionesCursos.css';

const CalificacionesCursos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tr } = useLang();
  const isStaff = user?.roles?.includes('admin') || user?.roles?.includes('profesor');

  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const isAdmin = user?.roles?.includes('admin');
      const isProfesor = user?.roles?.includes('profesor');

      if (isAdmin) {
        const res = await getCursos();
        setCursos(res.data);
      } else if (isProfesor) {
        const cursosRes = await getCursos();
        const modulosGroups = await Promise.all(
          cursosRes.data.map(c =>
            getModulosByCurso(c.id).then(r => r.data).catch(() => [])
          )
        );
        setCursos(
          cursosRes.data.filter((c, i) =>
            modulosGroups[i].some(m => m.id_profesor === user.id)
          )
        );
      } else {
        const [cursosRes, modulosRes] = await Promise.all([getCursos(), getMisModulos()]);
        const enrolledIds = new Set(modulosRes.data.map(m => m.id_curso));
        setCursos(cursosRes.data.filter(c => enrolledIds.has(c.id)));
      }
    };
    load().catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="cal-cursos-page">
      <PerfilHeader />

      <div className="cc-section">
        <h3 className="cc-section-title">
          {user?.roles?.includes('admin')
            ? 'Todos los cursos'
            : user?.roles?.includes('profesor')
              ? 'Mis cursos'
              : tr('cc_currentCourses')}
        </h3>
        <div className="cc-table-wrapper">
          {loading ? (
            <p className="cc-empty">{tr('loading')}</p>
          ) : cursos.length === 0 ? (
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
                {cursos.map(c => (
                  <tr key={c.id}>
                    <td className="cc-curso-link" onClick={() => navigate(`/curso/${c.id}`)}>
                      {c.nombre}
                    </td>
                    <td>
                      <button
                        className="cc-btn"
                        onClick={() => navigate(`/curso/${c.id}/calificaciones`)}
                      >
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
    </div>
  );
};

export default CalificacionesCursos;
