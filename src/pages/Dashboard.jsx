import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCursos, createCurso, getModulosByCurso, getRecursosByModulo } from '../api/cursos.api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Dashboard.css';

const VISIBLE_CAROUSEL = 3;

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_MINI = ['L','M','X','J','V','S','D'];

const buildCells = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
};

const MiniCalendario = ({ tareas }) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const cells = buildCells(year, month);

  const diasConTarea = new Set(
    tareas
      .filter(t => {
        const d = new Date(t.fecha_entrega);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map(t => new Date(t.fecha_entrega).getDate())
  );

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  return (
    <div className="mini-cal">
      <div className="mini-cal-nav">
        <button onClick={prevMonth}>‹</button>
        <span>{MESES[month]} {year}</span>
        <button onClick={nextMonth}>›</button>
      </div>
      <div className="mini-cal-grid">
        {DIAS_MINI.map(d => <span key={d} className="mini-cal-head">{d}</span>)}
        {cells.map((day, i) => {
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const hasTarea = day && diasConTarea.has(day);
          return (
            <span
              key={i}
              className={[
                'mini-cal-cell',
                !day ? 'mini-cal-empty' : '',
                isToday ? 'mini-cal-today' : '',
                hasTarea ? 'mini-cal-has-tarea' : '',
              ].filter(Boolean).join(' ')}
            >
              {day || ''}
              {hasTarea && <span className="mini-cal-dot" />}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const ModuloCard = ({ modulo, onClick }) => (
  <div className="course-card" onClick={onClick}>
    {modulo.url_imagen
      ? <img src={modulo.url_imagen} alt={modulo.nombre} className="course-thumb-img" onError={e => { e.target.style.display = 'none'; }} />
      : <div className="course-thumb" />
    }
    <span className="course-card-type">{modulo.cursoNombre}</span>
    <p className="course-card-name">{modulo.nombre}</p>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const isStaff = user?.roles?.includes('admin') || user?.roles?.includes('profesor');

  const [cursos, setCursos] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [codigoCurso, setCodigoCurso] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingModulos, setLoadingModulos] = useState(false);

  const [cursoModal, setCursoModal] = useState(false);
  const [nombreCurso, setNombreCurso] = useState('');
  const [savingCurso, setSavingCurso] = useState(false);
  const [cursoError, setCursoError] = useState('');

  const [timeline, setTimeline] = useState([]);
  const [timelineCount, setTimelineCount] = useState(5);

  useEffect(() => {
    getCursos()
      .then(res => setCursos(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (cursos.length === 0) return;
    setLoadingModulos(true);

    Promise.all(
      cursos.map(c =>
        getModulosByCurso(c.id)
          .then(r => r.data.map(m => ({ ...m, cursoNombre: c.nombre, cursoId: c.id })))
          .catch(() => [])
      )
    )
      .then(moduloGroups => {
        const allModulos = moduloGroups.flat();
        setModulos(allModulos);

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
      .finally(() => setLoadingModulos(false));
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
  const canNext = carouselIndex + VISIBLE_CAROUSEL < modulos.length;
  const visibleModulos = modulos.slice(carouselIndex, carouselIndex + VISIBLE_CAROUSEL);

  return (
    <div className="dashboard-page">
      <div className="dashboard-grid">

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

          {/* Módulos recientes */}
          <div className="widget-box">
            <div className="widget-header">Módulos Recientes</div>
            <div className="carousel-container">
              <button className="carousel-btn" onClick={() => setCarouselIndex(i => i - 1)} disabled={!canPrev}>‹</button>
              <div className="carousel-track">
                {loadingModulos ? (
                  <p className="empty-msg">Cargando módulos...</p>
                ) : modulos.length === 0 ? (
                  <p className="empty-msg">No hay módulos disponibles</p>
                ) : (
                  visibleModulos.map(m => (
                    <ModuloCard key={m.id} modulo={m} onClick={() => navigate(`/curso/${m.cursoId}`)} />
                  ))
                )}
              </div>
              <button className="carousel-btn" onClick={() => setCarouselIndex(i => i + 1)} disabled={!canNext}>›</button>
            </div>
          </div>

          {/* Vista general de módulos agrupados por curso */}
          <div className="widget-box">
            <div className="widget-header dash-header-row">
              <span>Vista General De Módulos</span>
              {isStaff && (
                <button className="btn-dash-create" onClick={() => { setNombreCurso(''); setCursoError(''); setCursoModal(true); }}>
                  ＋ Nuevo curso
                </button>
              )}
            </div>

            {loading || loadingModulos ? (
              <p className="empty-msg" style={{ padding: '14px' }}>Cargando...</p>
            ) : cursos.length === 0 ? (
              <p className="empty-msg" style={{ padding: '14px' }}>No hay cursos</p>
            ) : (
              cursos.map(curso => {
                const modulosCurso = modulos.filter(m => m.cursoId === curso.id);
                return (
                  <div key={curso.id} className="curso-grupo">
                    <div className="curso-grupo-header" onClick={() => navigate(`/curso/${curso.id}`)}>
                      <span className="curso-grupo-nombre">{curso.nombre}</span>
                      <span className="curso-grupo-count">{modulosCurso.length} módulo{modulosCurso.length !== 1 ? 's' : ''}</span>
                    </div>
                    {modulosCurso.length > 0 ? (
                      <div className="courses-grid">
                        {modulosCurso.map(m => (
                          <ModuloCard key={m.id} modulo={m} onClick={() => navigate(`/curso/${m.cursoId}`)} />
                        ))}
                      </div>
                    ) : (
                      <p className="empty-msg" style={{ padding: '10px 14px' }}>Sin módulos</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="dashboard-sidebar">

          <div className="widget-box">
            <div className="widget-header">Línea de Tiempo</div>
            <ul className="timeline-list">
              {loadingModulos ? (
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
            <MiniCalendario tareas={timeline} />
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
