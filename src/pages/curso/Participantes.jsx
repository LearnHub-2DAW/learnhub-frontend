import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCursoById, getModulosByCurso, getEnrolledUsers } from '../../api/cursos.api';
import { useLang } from '../../context/LangContext';
import usePagination from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';
import '../../components/Pagination.css';
import './Participantes.css';

const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const Participantes = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { tr } = useLang();
  const isAdmin = user?.roles?.includes('admin');
  const isProfesor = user?.roles?.includes('profesor') && !isAdmin;
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [letraActiva, setLetraActiva] = useState(null);
  const [participantes, setParticipantes] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [cursoRes, modulosRes] = await Promise.all([
          getCursoById(id),
          getModulosByCurso(id),
        ]);
        setCurso(cursoRes.data);

        const modulosFiltrados = isProfesor
          ? modulosRes.data.filter(m => m.id_profesor === user?.id)
          : modulosRes.data;

        const usuariosPorModulo = await Promise.all(
          modulosFiltrados.map(m =>
            getEnrolledUsers(m.id)
              .then(r => (r.data || []).map(u => ({ ...u, _moduloNombre: m.nombre })))
              .catch(() => [])
          )
        );

        const mapaUsuarios = new Map();
        for (const lista of usuariosPorModulo) {
          for (const u of lista) {
            if (mapaUsuarios.has(u.id)) {
              mapaUsuarios.get(u.id)._modulos.push(u._moduloNombre);
            } else {
              mapaUsuarios.set(u.id, { ...u, _modulos: [u._moduloNombre] });
            }
          }
        }
        setParticipantes([...mapaUsuarios.values()]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  const participantesFiltrados = participantes.filter(p => {
    const texto = `${p.nombre || ''} ${p.apellidos || ''} ${p.nombre_usuario || ''} ${p.correo_electronico || ''}`.toLowerCase();
    const coincideFiltro = texto.includes(filtro.toLowerCase());
    const coincideLetra = letraActiva
      ? (p.nombre || p.nombre_usuario || '').toUpperCase().startsWith(letraActiva)
      : true;
    return coincideFiltro && coincideLetra;
  });

  const { paginated, ...pg } = usePagination(participantesFiltrados);

  if (loading) return <div className="page-loading">{tr('pt_loadingParticipants')}</div>;

  return (
    <div className="participantes-page">
      <div className="page-card">

        <div className="page-card-header">
          <h1 className="page-title">{curso?.nombre || tr('dt_courseTitle')}</h1>
          <p className="page-breadcrumb">
            <Link to="/dashboard">{tr('home')}</Link>
            <span> / </span>
            <Link to={`/curso/${id}`}>{curso?.nombre || 'Curso'}</Link>
            <span> / </span>
            <span>{tr('cp_participants')}</span>
          </p>
        </div>

        <div className="participantes-body">
          <h2 className="section-title">
            {tr('cp_participants')}
            {participantes.length > 0 && (
              <span className="pt-count">{participantesFiltrados.length}</span>
            )}
          </h2>

          <div className="filter-box">
            <input
              type="text"
              placeholder={tr('pt_filterPlaceholder')}
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="letra-filter-row">
            <span className="letra-label">{tr('pt_filterByLetters')}</span>
            <div className="letra-buttons">
              {LETRAS.map(l => (
                <button
                  key={l}
                  className={`letra-btn ${letraActiva === l ? 'active' : ''}`}
                  onClick={() => setLetraActiva(letraActiva === l ? null : l)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <table className="participantes-table">
            <thead>
              <tr>
                <th>{tr('pt_colName')}</th>
                <th>{tr('pt_module')}</th>
              </tr>
            </thead>
            <tbody>
              {participantesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={2} className="no-data">
                    {tr('pt_noParticipants')}
                  </td>
                </tr>
              ) : (
                paginated.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="pt-nombre-row">
                        {p.nombre && (
                          <span className="pt-nombre">{`${p.nombre} ${p.apellidos || ''}`.trim()}</span>
                        )}
                        <span className="pt-username">@{p.nombre_usuario}</span>
                      </div>
                    </td>
                    <td>
                      <div className="pt-modulos">
                        {p._modulos.map((m, i) => <span key={i} className="pt-modulo-tag">{m}</span>)}
                      </div>
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

export default Participantes;
