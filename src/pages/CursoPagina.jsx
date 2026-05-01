import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCursoById, getModulosByCurso } from '../api/cursos.api';
import './CursoPagina.css';

const CursoPagina = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [curso, setCurso] = useState(null);
  const [modulos, setModulos] = useState([]);
  const [moduloActivo, setModuloActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gearOpen, setGearOpen] = useState(false);
  const gearRef = useRef(null);

  useEffect(() => {
    Promise.all([getCursoById(id), getModulosByCurso(id)])
      .then(([cursoRes, modulosRes]) => {
        setCurso(cursoRes.data);
        setModulos(modulosRes.data);
        if (modulosRes.data.length > 0) setModuloActivo(modulosRes.data[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // Cerrar el dropdown del engranaje al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (gearRef.current && !gearRef.current.contains(e.target)) {
        setGearOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (loading) return <div className="curso-loading">Cargando curso...</div>;

  return (
    <div className="curso-page">
      <div className="curso-grid">

        {/* ── CONTENIDO PRINCIPAL ── */}
        <div className="curso-main">
          <div className="curso-card">

            {/* Cabecera: título + engranaje */}
            <div className="curso-card-header">
              <div className="curso-title-block">
                <h1 className="curso-title">{curso?.nombre || 'Título Del Curso'}</h1>
                <p className="curso-breadcrumb">
                  <Link to="/dashboard">Inicio</Link>
                  <span> / </span>
                  <span>{curso?.nombre || 'Curso'}</span>
                </p>
              </div>

              <div className="gear-wrapper" ref={gearRef}>
                <button className="gear-btn" onClick={() => setGearOpen(o => !o)}>
                  ⚙ <span className="gear-arrow">▼</span>
                </button>
                {gearOpen && (
                  <ul className="gear-dropdown">
                    <li onClick={() => { navigate(`/curso/${id}/calificaciones`); setGearOpen(false); }}>
                      Calificaciones
                    </li>
                    <li onClick={() => { navigate(`/curso/${id}/participantes`); setGearOpen(false); }}>
                      Participantes
                    </li>
                    <li>Editar ajustes</li>
                  </ul>
                )}
              </div>
            </div>

            {/* Subcarpetas (módulos) */}
            <div className="subcarpetas-section">
              <div className="subcarpetas-header">Subcarpetas</div>
              <div className="subcarpetas-list">
                {modulos.length === 0 ? (
                  <p className="empty-section">No hay módulos en este curso</p>
                ) : (
                  modulos.map(mod => (
                    <div
                      key={mod.id}
                      className={`subcarpeta-item ${moduloActivo?.id === mod.id ? 'active' : ''}`}
                      onClick={() => setModuloActivo(mod)}
                    >
                      📁 {mod.nombre}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Contenido del módulo activo */}
            <div className="contenido-section">
              {moduloActivo ? (
                <div className="contenido-body">
                  <h3 className="contenido-modulo-title">{moduloActivo.nombre}</h3>
                  <p className="contenido-placeholder-txt">Contenido del módulo</p>
                </div>
              ) : (
                <p className="contenido-placeholder-txt">Contenido</p>
              )}
            </div>
          </div>
        </div>

        {/* ── SIDEBAR DERECHA ── */}
        <div className="curso-sidebar">
          <div className="widget-box">
            <div className="widget-header">Calendario</div>
            <div className="calendar-placeholder" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CursoPagina;
