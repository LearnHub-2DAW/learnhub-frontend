import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCursoById } from '../../api/cursos.api';
import { useLang } from '../../context/LangContext';
import './Calificaciones.css';

const Calificaciones = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { tr } = useLang();
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calificaciones] = useState([]);

  useEffect(() => {
    getCursoById(id)
      .then(res => setCurso(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-loading">{tr('loading')}</div>;

  return (
    <div className="calificaciones-page">
      <div className="page-card">

        <div className="page-card-header">
          <h1 className="page-title">{curso?.nombre || tr('dt_courseTitle')}</h1>
          <p className="page-breadcrumb">
            <Link to="/dashboard">{tr('home')}</Link>
            <span> / </span>
            <Link to={`/curso/${id}`}>{curso?.nombre || 'Curso'}</Link>
            <span> / </span>
            <span>{tr('h_grades')}</span>
          </p>
        </div>

        <div className="grades-body">
          <div className="grades-username">
            {user ? `${user.nombre} ${user.apellidos}` : '—'}
          </div>

          <table className="grades-table">
            <thead>
              <tr>
                <th>{tr('gr_gradingItem')}</th>
                <th>{tr('gr_calcWeight')}</th>
                <th>{tr('gr_grade')}</th>
                <th>{tr('gr_percentage')}</th>
                <th>{tr('gr_courseContrib')}</th>
              </tr>
            </thead>
            <tbody>
              {calificaciones.length === 0 ? (
                <tr>
                  <td colSpan={5} className="no-data">
                    {tr('gr_noGrades')}
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
