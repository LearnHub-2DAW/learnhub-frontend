import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCursos, createCurso, getModulosByCurso, getRecursosByModulo } from '../api/cursos.api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Dashboard.css';

const VISIBLE_CAROUSEL = 3;

const CursoCard = ({ curso, onClick }) => (
  <div className="course-card" onClick={onClick}>
    <div className="course-thumb" />
    <span className="course-card-type">Curso</span>
    <p className="course-card-name">{curso.nombre}</p>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const isStaff = user?.roles?.includes('admin') || user?.roles?.includes('profesor');

  const [cursos, setCursos] = useState([]);
  const [codigoCurso, setCodigoCurso] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [cursoModal, setCursoModal] = useState(false);
  const [nombreCurso, setNombreCurso] = useState('');
  const [savingCurso, setSavingCurso] = useState(false);
  const [cursoError, setCursoError] = useState('');

  const [timeline, setTimeline] = useState([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [timelineCount, setTimelineCount] = useState(5);

  useEffect(() => {
    getCursos()
      .then(res => setCursos(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (cursos.length === 0) return;
    setLoadingTimeline(true);
    Promise.all(
      cursos.map(c =>
        getModulosByCurso(c.id)
          .then(r => r.data.map(m => ({ ...m, cursoNombre: c.nombre, cursoId: c.id })))
          .catch(() => [])
      )
    )
      .then(moduloGroups => {
        const allModulos = moduloGroups.flat();
        if (allModulos.length === 0) return [];
        return Promise.all(
          allModulos.map(m =>
            getRecursosByModulo(m.id)
              .then(r => r.data.map(rec => ({ ...rec, cursoNombre: m.cursoNombre, cursoId: m.cursoId })))
              .catch(() => [])
          )
        );
      })
      .then(recursoGroups => {
        const now = new Date();
        const tareas = recursoGroups
          .flat()
          .filter(r => r.es_entregable === 1 && r.fecha_entrega && new Date(r.fecha_entrega) >= now)
          .sort((a, b) => new Date(a.fecha_entrega) - new Date(b.fecha_entrega));
        setTimeline(tareas);
      })
      .catch(console.error)
      .finally(() => setLoadingTimeline(false));
  }, [cursos]);

  const submitCurso = async () => {
    if (!nombreCurso.trim()) return setCursoError('El nombre es obligatorio');
    setSavingCurso(true);
    setCursoError('');
    try {
      const res = await createCurso({ nombre: nombreCurso });
      setCursos(prev => [...prev, res.data]);
      setCursoModal(false);
      setNombreCurso('');
      toast('Curso creado correctamente');
    } catch (err) {
      setCursoError(err.response?.data?.message || 'Error al crear');
    } finally {
      setSavingCurso(false);
    }
  };

  const canPrev = carouselIndex > 0;
  const canNext = carouselIndex + VISIBLE_CAROUSEL < cursos.length;
  const visibleCursos = cursos.slice(carouselIndex, carouselIndex + VISIBLE_CAROUSEL);

  return (
    <div className="dashboard-page">
      <div className="dashboard-grid">

        {/* ── COLUMNA PRINCIPAL ── */}
        <div className="dashboard-main">

          <div className="register-course-row">
            <span className="reg-label">Registrarse en un curso</span>
            <input
              type="text"
              placeholder="Código del Curso"
              value={codigoCurso}
              onChange={e => setCodigoCurso(e.target.value)}
              className="course-code-input"
            />
            <button className="btn-personalize">PERSONALIZAR ESTA PÁGINA</button>
          </div>

          <div className="widget-box">
            <div className="widget-header">Cursos Accedidos Recientemente</div>
            <div className="carousel-container">
              <button className="carousel-btn" onClick={() => setCarouselIndex(i => i - 1)} disabled={!canPrev}>‹</button>
              <div className="carousel-track">
                {loading ? (
                  <p className="empty-msg">Cargando cursos...</p>
                ) : cursos.length === 0 ? (
                  <p className="empty-msg">No hay cursos disponibles</p>
                ) : (
                  visibleCursos.map(c => (
                    <CursoCard key={c.id} curso={c} onClick={() => navigate(`/curso/${c.id}`)} />
                  ))
                )}
              </div>
              <button className="carousel-btn" onClick={() => setCarouselIndex(i => i + 1)} disabled={!canNext}>›</button>
            </div>
          </div>

          <div className="widget-box">
            <div className="widget-header dash-header-row">
              <span>Vista General De Cursos</span>
              {isStaff && (
                <button className="btn-dash-create" onClick={() => { setNombreCurso(''); setCursoError(''); setCursoModal(true); }}>
                  ＋ Nuevo curso
                </button>
              )}
            </div>
            <div className="courses-grid">
              {loading ? (
                <p className="empty-msg">Cargando...</p>
              ) : cursos.length === 0 ? (
                <p className="empty-msg">No hay cursos</p>
              ) : (
                cursos.map(c => (
                  <CursoCard key={c.id} curso={c} onClick={() => navigate(`/curso/${c.id}`)} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <div className="dashboard-sidebar">

          <div className="widget-box">
            <div className="widget-header">Línea de Tiempo</div>
            <ul className="timeline-list">
              {loadingTimeline ? (
                <li className="timeline-empty">Cargando tareas...</li>
              ) : timeline.length === 0 ? (
                <li className="timeline-empty">No hay tareas próximas</li>
              ) : (
                timeline.slice(0, timelineCount).map(t => (
                  <li key={t.id} className="timeline-item" onClick={() => navigate(`/recurso/${t.id}`)}>
                    <span className="tl-fecha">
                      {new Date(t.fecha_entrega).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="tl-titulo">{t.titulo}</span>
                    <span className="tl-curso">{t.cursoNombre}</span>
                  </li>
                ))
              )}
            </ul>
            {timeline.length > 0 && (
              <div className="timeline-footer">
                Mostrar&nbsp;
                <select
                  className="timeline-select"
                  value={timelineCount}
                  onChange={e => setTimelineCount(Number(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
              </div>
            )}
          </div>

          <div className="widget-box">
            <div className="widget-header">Calendario</div>
            <div className="calendar-placeholder" />
          </div>

          <div className="widget-box">
            <div className="widget-header">Usuarios en Línea</div>
            <div className="online-users-body">
              <p className="online-count">N usuarios online</p>
              <div className="online-user-row">
                <span className="user-dot" />
                <span>Usuario</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {cursoModal && (
        <div className="modal-overlay" onClick={() => setCursoModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Nuevo curso</h3>
            <div className="modal-field">
              <label>Nombre del curso</label>
              <input
                type="text"
                value={nombreCurso}
                onChange={e => setNombreCurso(e.target.value)}
                placeholder="Nombre del curso"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && submitCurso()}
              />
            </div>
            {cursoError && <p className="modal-error">{cursoError}</p>}
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setCursoModal(false)}>Cancelar</button>
              <button className="btn-modal-ok" onClick={submitCurso} disabled={savingCurso}>
                {savingCurso ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
