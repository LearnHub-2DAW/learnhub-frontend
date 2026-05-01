import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCursoById } from '../api/cursos.api';
import './Participantes.css';

const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const Participantes = () => {
  const { id } = useParams();
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [letraActiva, setLetraActiva] = useState(null);
  // Cuando el backend tenga el endpoint se rellenará este array
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

  if (loading) return <div className="page-loading">Cargando...</div>;

  return (
    <div className="participantes-page">
      <div className="page-card">

        {/* Cabecera del curso */}
        <div className="page-card-header">
          <h1 className="page-title">{curso?.nombre || 'Título Del Curso'}</h1>
          <p className="page-breadcrumb">
            <Link to="/dashboard">Inicio</Link>
            <span> / </span>
            <Link to={`/curso/${id}`}>{curso?.nombre || 'Curso'}</Link>
            <span> / </span>
            <span>Participantes</span>
          </p>
        </div>

        <div className="participantes-body">
          <h2 className="section-title">Participantes</h2>

          {/* Campo de filtrado */}
          <div className="filter-box">
            <input
              type="text"
              placeholder="Condiciones de Filtrado"
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Filtrado por letras */}
          <div className="letra-filter-row">
            <span className="letra-label">Filtrado por Letras</span>
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

          {/* Tabla de participantes */}
          <table className="participantes-table">
            <thead>
              <tr>
                <th>Nombre / Apellidos</th>
                <th>Roles</th>
                <th>Grupos</th>
                <th>Último Acceso</th>
              </tr>
            </thead>
            <tbody>
              {participantesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="no-data">
                    No hay participantes disponibles
                  </td>
                </tr>
              ) : (
                participantesFiltrados.map((p, i) => (
                  <tr key={i}>
                    <td>{p.nombre} {p.apellidos}</td>
                    <td>{p.rol}</td>
                    <td>{p.grupo || '—'}</td>
                    <td>{p.ultimo_acceso || 'Nunca'}</td>
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
