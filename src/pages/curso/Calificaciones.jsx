import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { getCursoById, getModulosByCurso, getRecursosByModulo } from '../../api/cursos.api';
import { getMisModulos, getMisEntregas } from '../../api/usuario.api';
import usePagination from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';
import '../../components/Pagination.css';
import './Calificaciones.css';

const Calificaciones = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { tr } = useLang();
  const navigate = useNavigate();
  const isStaff = user?.roles?.includes('admin') || user?.roles?.includes('profesor');
  const isAdmin = user?.roles?.includes('admin');
  const isProfesor = user?.roles?.includes('profesor') && !isAdmin;

  const [curso, setCurso] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (isStaff) {
        const [cursoRes, modulosRes] = await Promise.all([
          getCursoById(id),
          getModulosByCurso(id),
        ]);
        setCurso(cursoRes.data);
        const modulos = isProfesor
          ? modulosRes.data.filter(m => m.id_profesor === user?.id)
          : modulosRes.data;

        const recursosGroups = await Promise.all(
          modulos.map(m =>
            getRecursosByModulo(m.id)
              .then(r => r.data.map(rec => ({ ...rec, moduloNombre: m.nombre })))
              .catch(() => [])
          )
        );
        setItems(
          recursosGroups.flat()
            .filter(r => r.es_entregable === 1)
            .map(r => ({ recurso: r, entrega: null }))
        );
      } else {
        const [cursoRes, misModulosRes, misEntregasRes] = await Promise.all([
          getCursoById(id),
          getMisModulos(),
          getMisEntregas(),
        ]);
        setCurso(cursoRes.data);

        const modulosCurso = misModulosRes.data.filter(m => m.id_curso === Number(id));
        const entregaMap = {};
        misEntregasRes.data.forEach(e => { entregaMap[e.id_recurso] = e; });

        const recursosGroups = await Promise.all(
          modulosCurso.map(m =>
            getRecursosByModulo(m.id)
              .then(r => r.data.map(rec => ({ ...rec, moduloNombre: m.nombre })))
              .catch(() => [])
          )
        );
        setItems(
          recursosGroups.flat()
            .filter(r => r.es_entregable === 1)
            .map(r => ({ recurso: r, entrega: entregaMap[r.id] || null }))
        );
      }
    };

    load().catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const formatFecha = (f) => {
    if (!f) return '—';
    return new Date(f).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const { paginated, ...pg } = usePagination(items);

  if (loading) return <div className="page-loading">{tr('loading')}</div>;

  return (
    <div className="calificaciones-page">
      <div className="page-card">

        <div className="page-card-header">
          <h1 className="page-title">{curso?.nombre || tr('dt_courseTitle')}</h1>
          <p className="page-breadcrumb">
            <Link to="/dashboard">{tr('home')}</Link>
            <span> / </span>
            <Link to={`/curso/${id}`}>{curso?.nombre || tr('dt_courseTitle')}</Link>
            <span> / </span>
            <span>{tr('h_grades')}</span>
          </p>
        </div>

        <div className="grades-body">
          {!isStaff && (
            <div className="grades-username">
              {user ? `${user.nombre || ''} ${user.apellidos || ''}`.trim() : '—'}
            </div>
          )}

          <table className="grades-table">
            <thead>
              <tr>
                <th>{tr('gr_gradingItem')}</th>
                <th>{tr('gr_module')}</th>
                <th>{tr('gr_dueDate')}</th>
                {!isStaff && <th>{tr('gr_grade')}</th>}
                <th>{tr('gr_status')}</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={isStaff ? 4 : 5} className="no-data">
                    {tr('gr_noGrades')}
                  </td>
                </tr>
              ) : (
                paginated.map(({ recurso, entrega }) => (
                  <tr
                    key={recurso.id}
                    className="gr-row-link"
                    onClick={() => navigate(`/recurso/${recurso.id}`)}
                  >
                    <td className="gr-td-name">{recurso.titulo}</td>
                    <td className="gr-td-muted">{recurso.moduloNombre}</td>
                    <td className="gr-td-muted">{formatFecha(recurso.fecha_entrega)}</td>
                    {!isStaff && (
                      <td className={entrega?.calificacion != null ? 'gr-grade gr-graded' : 'gr-grade'}>
                        {entrega?.calificacion != null ? `${entrega.calificacion}/10` : '—'}
                      </td>
                    )}
                    <td>
                      {isStaff ? (
                        <span className="gr-td-muted">{tr('gr_viewSubmissions')} →</span>
                      ) : entrega ? (
                        <span className="gr-badge gr-badge-submitted">{tr('gr_submitted')}</span>
                      ) : (
                        <span className="gr-badge gr-badge-missing">{tr('gr_notSubmitted')}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination {...pg} />
        </div>
      </div>
    </div>
  );
};

export default Calificaciones;
