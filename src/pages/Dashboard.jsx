import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCursos, createCurso, getModulosByCurso, getRecursosByModulo } from '../api/cursos.api';
import { getMisModulos } from '../api/usuario.api';
import { getFileUrl } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLang } from '../context/LangContext';
import { useSocket } from '../context/SocketContext';
import { useChatDrawer } from '../context/ChatDrawerContext';
import './Dashboard.css';

const VISIBLE_CAROUSEL = 3;

const buildCells = (year, month, startDay = 1) => {
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay - startDay + 7) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
};

const DIA_SEMANA_JS = {
  'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4,
  'Viernes': 5, 'Sábado': 6, 'Domingo': 0,
};

const MiniCalendario = ({ tareas }) => {
  const today = new Date();
  const { tr } = useLang();
  const { user } = useAuth();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const MESES = tr('cal_months');
  const DIAS_MINI = tr('cal_daysMini');
  const startDay = DIA_SEMANA_JS[user?.primer_dia_semana] ?? 1;
  const startIdx = startDay === 0 ? 6 : startDay - 1;
  const DIAS_ROTADOS = [...DIAS_MINI.slice(startIdx), ...DIAS_MINI.slice(0, startIdx)];
  const cells = buildCells(year, month, startDay);

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
        {DIAS_ROTADOS.map((d, i) => <span key={i} className="mini-cal-head">{d}</span>)}
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

const modImgUrl = (u) => !u ? null : u.startsWith('http') ? u : getFileUrl(u);

const ModuloCard = ({ modulo, onClick }) => (
  <div className="course-card" onClick={onClick}>
    {modulo.url_imagen
      ? <img src={modImgUrl(modulo.url_imagen)} alt={modulo.nombre} className="course-thumb-img" onError={e => { e.target.style.display = 'none'; }} />
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
  const { tr } = useLang();
  const { usuariosOnline } = useSocket();
  const { openChat } = useChatDrawer();
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
    if (isStaff) {
      getCursos()
        .then(res => setCursos(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      Promise.all([getCursos(), getMisModulos().catch(() => ({ data: [] }))])
        .then(([cursosRes, misModulosRes]) => {
          const idsCursosMatriculados = new Set(
            (misModulosRes.data || []).map(m => m.id_curso)
          );
          setCursos(cursosRes.data.filter(c => idsCursosMatriculados.has(c.id)));
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
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

  const handleEnrollByCode = () => {
    if (codigoCurso.trim()) {
      sessionStorage.setItem('claveMatriculaPendiente', codigoCurso.trim());
      setCodigoCurso('');
    }
    navigate('/cursos');
  };

  const submitCurso = async () => {
    if (!nombreCurso.trim()) return setCursoError(tr('d_nameRequired'));
    setSavingCurso(true);
    setCursoError('');
    try {
      const res = await createCurso({ nombre: nombreCurso });
      setCursos(prev => [...prev, res.data]);
      setCursoModal(false);
      setNombreCurso('');
      toast(tr('d_courseCreated'));
    } catch (err) {
      setCursoError(err.response?.data?.message || tr('d_errorCreate'));
    } finally {
      setSavingCurso(false);
    }
  };

  const canPrev = carouselIndex > 0;
  const canNext = carouselIndex + VISIBLE_CAROUSEL < modulos.length;
  const visibleModulos = modulos.slice(carouselIndex, carouselIndex + VISIBLE_CAROUSEL);

  const moduloLabel = (count) => `${count} ${count !== 1 ? tr('d_modules') : tr('d_module')}`;

  return (
    <div className="dashboard-page">
      <div className="dashboard-grid">

        <div className="dashboard-main">

          <div className="register-course-row">
            <span className="reg-label">{tr('d_enroll')}</span>
            <input
              type="text"
              placeholder={tr('d_enroll_placeholder')}
              value={codigoCurso}
              onChange={e => setCodigoCurso(e.target.value)}
              className="course-code-input"
              onKeyDown={e => e.key === 'Enter' && handleEnrollByCode()}
            />
            <button className="btn-personalize" onClick={handleEnrollByCode}>
              {codigoCurso.trim() ? tr('cp_enroll') : tr('d_browse_courses')}
            </button>
          </div>

          <div className="widget-box">
            <div className="widget-header">{tr('d_recentModules')}</div>
            <div className="carousel-container">
              <button className="carousel-btn" onClick={() => setCarouselIndex(i => i - 1)} disabled={!canPrev}>‹</button>
              <div className="carousel-track">
                {loadingModulos ? (
                  <p className="empty-msg">{tr('d_loadingModules')}</p>
                ) : modulos.length === 0 ? (
                  <p className="empty-msg">{tr('d_noModules')}</p>
                ) : (
                  visibleModulos.map(m => (
                    <ModuloCard key={m.id} modulo={m} onClick={() => navigate(`/curso/${m.cursoId}`)} />
                  ))
                )}
              </div>
              <button className="carousel-btn" onClick={() => setCarouselIndex(i => i + 1)} disabled={!canNext}>›</button>
            </div>
          </div>

          <div className="widget-box">
            <div className="widget-header dash-header-row">
              <span>{tr('d_overview')}</span>
              {isStaff && (
                <button className="btn-dash-create" onClick={() => { setNombreCurso(''); setCursoError(''); setCursoModal(true); }}>
                  {tr('d_newCourse')}
                </button>
              )}
            </div>

            {loading || loadingModulos ? (
              <p className="empty-msg" style={{ padding: '14px' }}>{tr('d_loadingCourses')}</p>
            ) : cursos.length === 0 ? (
              <p className="empty-msg" style={{ padding: '14px' }}>{tr('d_noCourses')}</p>
            ) : (
              cursos.map(curso => {
                const modulosCurso = modulos.filter(m => m.cursoId === curso.id);
                return (
                  <div key={curso.id} className="curso-grupo">
                    <div className="curso-grupo-header" onClick={() => navigate(`/curso/${curso.id}`)}>
                      <span className="curso-grupo-nombre">{curso.nombre}</span>
                      <span className="curso-grupo-count">{moduloLabel(modulosCurso.length)}</span>
                    </div>
                    {modulosCurso.length > 0 ? (
                      <div className="courses-grid">
                        {modulosCurso.map(m => (
                          <ModuloCard key={m.id} modulo={m} onClick={() => navigate(`/curso/${m.cursoId}`)} />
                        ))}
                      </div>
                    ) : (
                      <p className="empty-msg" style={{ padding: '10px 14px' }}>{tr('d_noModulesCourse')}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="dashboard-sidebar">

          <div className="widget-box">
            <div className="widget-header">{tr('d_timeline')}</div>
            <ul className="timeline-list">
              {loadingModulos ? (
                <li className="timeline-empty">{tr('d_loadingTasks')}</li>
              ) : timeline.length === 0 ? (
                <li className="timeline-empty">{tr('d_noUpcomingTasks')}</li>
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
                {tr('d_show')}&nbsp;
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
            <div className="widget-header">{tr('cal_title')}</div>
            <MiniCalendario tareas={timeline} />
          </div>

          <div className="widget-box">
            <div className="widget-header">
              {tr('d_onlineUsers')}
              <span className="online-badge">{usuariosOnline.length}</span>
            </div>
            <div className="online-users-body">
              {usuariosOnline.length === 0 ? (
                <p className="online-empty">{tr('d_noUsersOnline')}</p>
              ) : (
                usuariosOnline.map(u => (
                  <div
                    key={u.id}
                    className="online-user-row"
                    onClick={() => openChat(u.id, u.nombre_usuario)}
                  >
                    <span className="user-dot" />
                    <span className="online-username">{u.nombre_usuario}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {cursoModal && (
        <div className="modal-overlay" onClick={() => setCursoModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{tr('d_newCourseTitle')}</h3>
            <div className="modal-field">
              <label>{tr('d_newCourseName')}</label>
              <input
                type="text"
                value={nombreCurso}
                onChange={e => setNombreCurso(e.target.value)}
                placeholder={tr('d_newCourseName')}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && submitCurso()}
              />
            </div>
            {cursoError && <p className="modal-error">{cursoError}</p>}
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setCursoModal(false)}>{tr('cancel')}</button>
              <button className="btn-modal-ok" onClick={submitCurso} disabled={savingCurso}>
                {savingCurso ? tr('creating') : tr('create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
