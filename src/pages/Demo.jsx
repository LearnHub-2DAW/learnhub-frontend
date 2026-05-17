import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Demo.css';

// ── Datos ficticios ────────────────────────────────────────────────────────
const CURSOS = [
  { id: 1, nombre: 'Programación Web' },
  { id: 2, nombre: 'Diseño UX' },
];

const MODULOS_PW = [
  { id: 1, nombre: 'Introducción a HTML' },
  { id: 2, nombre: 'CSS Moderno' },
  { id: 3, nombre: 'JavaScript ES6+' },
  { id: 4, nombre: 'React Fundamentals' },
];

const MODULOS_UX = [
  { id: 5, nombre: 'Fundamentos del Diseño' },
  { id: 6, nombre: 'User Research' },
  { id: 7, nombre: 'Prototipado' },
];

const CURSOS_LISTA = [
  { cursoId: 1, nombre: 'Programación Web', modulos: MODULOS_PW },
  { cursoId: 2, nombre: 'Diseño UX', modulos: MODULOS_UX },
  { cursoId: 3, nombre: 'Marketing Digital', modulos: [{ id: 8, nombre: 'SEO Básico' }, { id: 9, nombre: 'Redes Sociales' }, { id: 10, nombre: 'Email Marketing' }] },
  { cursoId: 4, nombre: 'Python para Datos', modulos: [{ id: 11, nombre: 'Introducción a Python' }, { id: 12, nombre: 'Pandas y NumPy' }] },
];

const ENROLLED_IDS = new Set([1, 2, 3, 4, 5, 6, 7]);

const RECURSOS_HTML = [
  { id: 1, titulo: 'Guía completa de HTML5', es_entregable: 0 },
  { id: 2, titulo: 'Crea tu primera página web', es_entregable: 1, fecha_entrega: '2026-05-25T00:00:00' },
  { id: 3, titulo: 'Formulario de contacto', es_entregable: 1, fecha_entrega: '2026-06-01T00:00:00' },
];

const ENTREGAS = [
  { id_recurso: 2, titulo: 'Crea tu primera página web', fecha_entregado: '2026-05-10T10:30:00', calificacion: 9 },
  { id_recurso: 4, titulo: 'Layout con Flexbox', fecha_entregado: '2026-04-28T15:00:00', calificacion: 8 },
  { id_recurso: 5, titulo: 'Calculadora interactiva', fecha_entregado: '2026-04-15T09:00:00', calificacion: null },
  { id_recurso: 3, titulo: 'Formulario de contacto', fecha_entregado: null, calificacion: null },
];

const TIMELINE = [
  { id: 2, titulo: 'Crea tu primera página web', fecha_entrega: '2026-05-25T00:00:00', cursoNombre: 'Programación Web' },
  { id: 3, titulo: 'Formulario de contacto', fecha_entrega: '2026-06-01T00:00:00', cursoNombre: 'Programación Web' },
];

// ── Pantalla 1: Dashboard ─────────────────────────────────────────────────
function ScreenDashboard() {
  const DIAS_MINI = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  // Mayo 2026: día 1 = viernes → offset 4
  const cells = [...Array(4).fill(null), ...Array.from({ length: 31 }, (_, i) => i + 1)];
  const tareasDia = new Set([25]);
  const todayNum = 17; // 17 mayo 2026

  return (
    <div className="dashboard-page">
      <div className="dashboard-grid">

        <div className="dashboard-main">
          <div className="register-course-row">
            <span className="reg-label">Matricularse en un módulo</span>
            <input type="text" placeholder="Introduce el código del módulo..." className="course-code-input" readOnly />
            <button className="btn-personalize" disabled>Explorar cursos</button>
          </div>

          <div className="widget-box">
            <div className="widget-header">Módulos recientes</div>
            <div className="carousel-container">
              <button className="carousel-btn" disabled>‹</button>
              <div className="carousel-track">
                {MODULOS_PW.slice(0, 3).map(m => (
                  <div key={m.id} className="course-card">
                    <div className="course-thumb" />
                    <span className="course-card-type">Programación Web</span>
                    <p className="course-card-name">{m.nombre}</p>
                  </div>
                ))}
              </div>
              <button className="carousel-btn" disabled>›</button>
            </div>
          </div>

          <div className="widget-box">
            <div className="widget-header">Vista General</div>
            {CURSOS.map((c, idx) => {
              const mods = idx === 0 ? MODULOS_PW : MODULOS_UX;
              return (
                <div key={c.id} className="curso-grupo">
                  <div className="curso-grupo-header">
                    <span className="curso-grupo-nombre">{c.nombre}</span>
                    <span className="curso-grupo-count">{mods.length} módulos</span>
                  </div>
                  <div className="courses-grid">
                    {mods.map(m => (
                      <div key={m.id} className="course-card">
                        <div className="course-thumb" />
                        <span className="course-card-type">{c.nombre}</span>
                        <p className="course-card-name">{m.nombre}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="dashboard-sidebar">
          <div className="widget-box">
            <div className="widget-header">Próximas entregas</div>
            <ul className="timeline-list">
              {TIMELINE.map(t => (
                <li key={t.id} className="timeline-item">
                  <span className="tl-fecha">
                    {new Date(t.fecha_entrega).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="tl-titulo">{t.titulo}</span>
                  <span className="tl-curso">{t.cursoNombre}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="widget-box">
            <div className="widget-header">Calendario</div>
            <div className="mini-cal">
              <div className="mini-cal-nav">
                <button>‹</button>
                <span>Mayo 2026</span>
                <button>›</button>
              </div>
              <div className="mini-cal-grid">
                {DIAS_MINI.map((d, i) => <span key={i} className="mini-cal-head">{d}</span>)}
                {cells.map((day, i) => (
                  <span
                    key={i}
                    className={[
                      'mini-cal-cell',
                      !day ? 'mini-cal-empty' : '',
                      day === todayNum ? 'mini-cal-today' : '',
                      day && tareasDia.has(day) ? 'mini-cal-has-tarea' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    {day || ''}
                    {day && tareasDia.has(day) && <span className="mini-cal-dot" />}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="widget-box">
            <div className="widget-header">
              Usuarios en línea
              <span className="online-badge">2</span>
            </div>
            <div className="online-users-body">
              {[{ id: 10, nombre_usuario: 'carlos.prof' }, { id: 11, nombre_usuario: 'maria.garcia' }].map(u => (
                <div key={u.id} className="online-user-row">
                  <span className="user-dot" />
                  <span className="online-username">{u.nombre_usuario}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Pantalla 2: Explorar cursos ───────────────────────────────────────────
function ScreenCursos() {
  return (
    <div className="cl-page">
      <div className="cl-header">
        <h1 className="cl-title">Explorar cursos</h1>
        <input type="text" className="cl-search" placeholder="Buscar cursos..." readOnly />
      </div>
      <div className="cl-list">
        {CURSOS_LISTA.map(({ cursoId, nombre, modulos }) => (
          <div key={cursoId} className="cl-curso-card">
            <div className="cl-curso-header">
              <h2 className="cl-curso-nombre">{nombre}</h2>
              <span className="cl-modulos-count">{modulos.length} módulos</span>
            </div>
            <div className="cl-modulos-grid">
              {modulos.map(m => {
                const enrolled = ENROLLED_IDS.has(m.id);
                return (
                  <div key={m.id} className={`cl-modulo-item${enrolled ? ' cl-enrolled' : ''}`}>
                    <span className="cl-modulo-nombre">{m.nombre}</span>
                    {enrolled && <span className="cl-enrolled-badge">✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Pantalla 3: Módulo ────────────────────────────────────────────────────
function ScreenModulo() {
  const [moduloActivo, setModuloActivo] = useState(MODULOS_PW[0]);

  const tareasSidebar = RECURSOS_HTML.filter(
    r => r.es_entregable === 1 && r.fecha_entrega && new Date(r.fecha_entrega) >= new Date()
  );

  return (
    <div className="curso-page">
      <div className="curso-grid">
        <div className="curso-main">
          <div className="curso-card">
            <div className="curso-card-header">
              <div className="curso-title-block">
                <h1 className="curso-title">Programación Web</h1>
                <p className="curso-breadcrumb">
                  Inicio
                  <span className="bc-sep"> / </span>
                  <span className="bc-link">Programación Web</span>
                  <span className="bc-sep"> / </span>
                  <span>{moduloActivo.nombre}</span>
                </p>
              </div>
              <button className="gear-btn" disabled>⚙ <span className="gear-arrow">▼</span></button>
            </div>

            <div className="subcarpetas-section">
              <div className="subcarpetas-header">Módulos</div>
              <div className="subcarpetas-list">
                {MODULOS_PW.map(mod => (
                  <div
                    key={mod.id}
                    className={`subcarpeta-item ${moduloActivo.id === mod.id ? 'active' : ''}`}
                    onClick={() => setModuloActivo(mod)}
                  >
                    <span className="subcarpeta-nombre">
                      <span className="subcarpeta-folder">📁</span>
                      {mod.nombre}
                    </span>
                    <button className="btn-enroll-modulo enrolled" disabled>
                      Desmatricularse
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="contenido-section">
              <div className="contenido-body">
                <div className="contenido-header-row">
                  <h3 className="contenido-modulo-title">{moduloActivo.nombre}</h3>
                </div>
                {moduloActivo.id === MODULOS_PW[0].id ? (
                  <ul className="recursos-list">
                    {RECURSOS_HTML.map(r => (
                      <li key={r.id} className="recurso-item">
                        <span className="recurso-icon">{r.es_entregable === 1 ? '📝' : '📄'}</span>
                        <span className="recurso-titulo">{r.titulo}</span>
                        {r.es_entregable === 1 && r.fecha_entrega && (
                          <span className="recurso-fecha">
                            Entrega: {new Date(r.fecha_entrega).toLocaleDateString('es-ES')}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="contenido-placeholder-txt">Selecciona un módulo para ver su contenido.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="curso-sidebar">
          <div className="widget-box">
            <div className="widget-header">Próximas entregas</div>
            <ul className="sidebar-tasks-list">
              {tareasSidebar.map(t => (
                <li key={t.id} className="sidebar-task-item">
                  <span className="sidebar-task-fecha">
                    {new Date(t.fecha_entrega).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                  </span>
                  <span className="sidebar-task-titulo">📝 {t.titulo}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Pantalla 4: Mis Entregas ──────────────────────────────────────────────
function ScreenEntregas() {
  const fmt = (f) => f
    ? new Date(f).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className="mis-entregas-page">
      <div className="page-card">
        <div className="page-card-header">
          <h1 className="page-title">Mis Entregas</h1>
          <p className="page-breadcrumb">
            <span>Inicio</span>
            <span> / </span>
            <span>Mis Entregas</span>
          </p>
        </div>
        <div className="mis-entregas-body">
          <table className="entregas-table">
            <thead>
              <tr>
                <th>Tarea</th>
                <th>Fecha de entrega</th>
                <th>Calificación</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ENTREGAS.map((e, i) => (
                <tr key={i} className="entrega-row">
                  <td>{e.titulo}</td>
                  <td className="fecha-cell">{fmt(e.fecha_entregado)}</td>
                  <td className={e.calificacion != null
                    ? 'calificacion-cell calificacion-nota'
                    : 'calificacion-cell calificacion-pendiente'}>
                    {e.calificacion != null ? `${e.calificacion}/10` : '—'}
                  </td>
                  <td>
                    <span className="btn-ver-recurso">Ver recurso</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Pantalla 5: Perfil ────────────────────────────────────────────────────
function ScreenPerfil() {
  return (
    <div className="editar-perfil-page">
      <div className="perfil-header-card">
        <div className="ph-user-info">
          <div className="ph-avatar" style={{ background: 'var(--brand)' }}>AG</div>
          <div className="ph-name">ana.garcia</div>
        </div>
        <button className="ph-gear-btn" disabled>
          ⚙ Configuración <span className="ph-gear-arrow">▾</span>
        </button>
      </div>

      <div className="ep-form-card">
        <h3 className="ep-form-title">ana.garcia</h3>

        <div className="ep-section">
          <h4 className="ep-section-label">Información general</h4>

          {[
            { label: 'Nombre *', value: 'Ana' },
            { label: 'Apellidos *', value: 'García' },
            { label: 'Correo electrónico *', value: 'ana.garcia@email.com' },
            { label: 'Ciudad', value: 'Madrid' },
            { label: 'País', value: 'España' },
          ].map(f => (
            <div key={f.label} className="ep-field">
              <label>{f.label}</label>
              <div className="ep-input-row">
                <input type="text" defaultValue={f.value} readOnly />
                <span className="ep-info">ℹ</span>
              </div>
            </div>
          ))}
        </div>

        <div className="ep-section">
          <h4 className="ep-section-label">Imagen de perfil</h4>
          <div className="ep-field">
            <label>URL de imagen</label>
            <input type="url" placeholder="https://..." readOnly />
          </div>
        </div>

        <div className="ep-actions">
          <button className="btn-guardar" disabled>Guardar cambios</button>
          <button className="btn-cancelar" disabled>Cancelar</button>
        </div>
        <p className="ep-required-note">
          <span className="ep-info">ℹ</span> Los campos marcados con * son obligatorios.
        </p>
      </div>
    </div>
  );
}

// ── Configuración de pasos ────────────────────────────────────────────────
const STEPS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: '🏠',
    title: 'Tu panel principal',
    desc: 'El Dashboard es tu punto de partida. Ves de un vistazo todos tus cursos, los módulos más recientes, las próximas entregas y el calendario. Desde aquí también puedes unirte a nuevos módulos con un código.',
    Screen: ScreenDashboard,
  },
  {
    key: 'cursos',
    label: 'Explorar cursos',
    icon: '📚',
    title: 'Todos los cursos disponibles',
    desc: 'En esta pantalla aparecen todos los cursos de la plataforma con sus módulos. Los módulos en los que ya estás matriculado aparecen marcados con ✓ en verde. Puedes buscar cursos por nombre.',
    Screen: ScreenCursos,
  },
  {
    key: 'modulo',
    label: 'Módulo',
    icon: '📖',
    title: 'Contenido de un módulo',
    desc: 'Dentro de cada curso hay módulos temáticos. El profesor sube recursos (documentos, vídeos...) y publica tareas con fecha límite. Haz clic en los módulos de la izquierda para navegar entre ellos.',
    Screen: ScreenModulo,
  },
  {
    key: 'entregas',
    label: 'Mis Entregas',
    icon: '📋',
    title: 'Historial de entregas',
    desc: 'En Mis Entregas ves todas las tareas que has entregado con su calificación. Las entregas pendientes de corrección muestran "—". Haz clic en una fila para ir al recurso.',
    Screen: ScreenEntregas,
  },
  {
    key: 'perfil',
    label: 'Perfil',
    icon: '👤',
    title: 'Tu perfil personal',
    desc: 'En tu perfil actualizas tu información personal, cambias tu contraseña y gestionas los ajustes de tu cuenta. Desde el botón de configuración también accedes a preferencias de idioma y notificaciones.',
    Screen: ScreenPerfil,
  },
];

// ── Componente principal ──────────────────────────────────────────────────
const Demo = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { Screen, title, desc, icon } = STEPS[step];

  return (
    <div className="demo-page">
      <div className="demo-topbar">
        <div className="demo-topbar-left">
          <img src="/logo-buho.png" alt="LearnHub" className="demo-logo" />
          <span className="demo-brand">LearnHub</span>
          <span className="demo-badge">MODO DEMO</span>
        </div>
        <div className="demo-topbar-right">
          <button className="demo-btn-register" onClick={() => navigate('/register')}>
            Crear cuenta gratis
          </button>
          <button className="demo-btn-exit" onClick={() => navigate('/login')}>
            ✕ Salir
          </button>
        </div>
      </div>

      <div className="demo-tabs">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            className={`demo-tab ${i === step ? 'demo-tab-active' : ''}`}
            onClick={() => setStep(i)}
          >
            <span className="demo-tab-icon">{s.icon}</span>
            <span className="demo-tab-label">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="demo-screen-wrap">
        <Screen />
      </div>

      <div className="demo-footer">
        <div className="demo-footer-inner">
          <div className="demo-footer-text">
            <div className="demo-footer-step">{icon} Paso {step + 1} de {STEPS.length} — {title}</div>
            <p className="demo-footer-desc">{desc}</p>
          </div>
          <div className="demo-footer-nav">
            <div className="demo-dots">
              {STEPS.map((_, i) => (
                <span key={i} className={`demo-dot ${i === step ? 'demo-dot-active' : ''}`} onClick={() => setStep(i)} />
              ))}
            </div>
            <button className="demo-nav-btn" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
              ← Anterior
            </button>
            {step < STEPS.length - 1 ? (
              <button className="demo-nav-btn demo-nav-next" onClick={() => setStep(s => s + 1)}>
                Siguiente →
              </button>
            ) : (
              <button className="demo-nav-btn demo-nav-finish" onClick={() => navigate('/register')}>
                ¡Crear mi cuenta! →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
