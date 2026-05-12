import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCursoById } from '../api/cursos.api';
import { useLang } from '../context/LangContext';
import './Participantes.css';

const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const Participantes = () => {
  const { id } = useParams();
  const { tr } = useLang();
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [letraActiva, setLetraActiva] = useState(null);
  const [participantes] = useState([]);

  useEffect(() => {
    getCursoById(id)
      .then(res => setCurso(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const participantesFiltrados = participantes.filter(p => {
    const nombre = `${p.nombre} ${p.apellidos}`.toLowerCase();
    const coincideFiltro = nombre.includes(filtro.toLowerCase());
    const coincideLetra = letraActiva
      ? p.nombre?.toUpperCase().startsWith(letraActiva)
      : true;
    return coincideFiltro && coincideLetra;
  });

  if (loading) return <div className="page-loading">{tr('loading')}</div>;

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
          <h2 className="section-title">{tr('cp_participants')}</h2>

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
                <th>{tr('pt_colRoles')}</th>
                <th>{tr('pt_colGroups')}</th>
                <th>{tr('pt_colLastAccess')}</th>
              </tr>
            </thead>
            <tbody>
              {participantesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="no-data">
                    {tr('pt_noParticipants')}
                  </td>
                </tr>
              ) : (
                participantesFiltrados.map((p, i) => (
                  <tr key={i}>
                    <td>{p.nombre} {p.apellidos}</td>
                    <td>{p.rol}</td>
                    <td>{p.grupo || '—'}</td>
                    <td>{p.ultimo_acceso || tr('pt_never')}</td>
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

export default Participantes;
