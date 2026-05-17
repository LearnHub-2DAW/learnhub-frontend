import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Demo.css';

// ── Datos ficticios ────────────────────────────────────────────────────────
const MODULOS_PW = [
  { id: 1, nombre: 'Introducción a HTML' },
  { id: 2, nombre: 'CSS Moderno' },
  { id: 3, nombre: 'JavaScript ES6+' },
  { id: 4, nombre: 'React Fundamentals' },
];

const RECURSOS_HTML = [
  { id: 1, titulo: 'Guía completa de HTML5', es_entregable: 0 },
  { id: 2, titulo: 'Crea tu primera página web', es_entregable: 1, fecha_entrega: '2026-05-25T00:00:00' },
  { id: 3, titulo: 'Formulario de contacto', es_entregable: 1, fecha_entrega: '2026-06-01T00:00:00' },
];

const ENTREGAS = [
  { titulo: 'Crea tu primera página web', fecha_entregado: '2026-05-10T10:30:00', calificacion: 9 },
  { titulo: 'Layout con Flexbox', fecha_entregado: '2026-04-28T15:00:00', calificacion: 8 },
  { titulo: 'Calculadora interactiva', fecha_entregado: '2026-04-15T09:00:00', calificacion: null },
  { titulo: 'Formulario de contacto', fecha_entregado: null, calificacion: null },
];

const TIMELINE = [
  { id: 2, titulo: 'Crea tu primera página web', fecha_entrega: '2026-05-25T00:00:00', cursoNombre: 'Programación Web' },
  { id: 3, titulo: 'Formulario de contacto', fecha_entrega: '2026-06-01T00:00:00', cursoNombre: 'Programación Web' },
];

const CALIFICACIONES = [
  { titulo: 'Crea tu primera página web', modulo: 'Introducción a HTML', fecha: '2026-05-25T00:00:00', calificacion: 9, entregado: true },
  { titulo: 'Layout con Flexbox', modulo: 'CSS Moderno', fecha: '2026-04-30T00:00:00', calificacion: 8, entregado: true },
  { titulo: 'Calculadora interactiva', modulo: 'JavaScript ES6+', fecha: '2026-04-20T00:00:00', calificacion: null, entregado: true },
  { titulo: 'Formulario de contacto', modulo: 'Introducción a HTML', fecha: '2026-06-01T00:00:00', calificacion: null, entregado: false },
];

const PARTICIPANTES = [
  { nombre: 'Ana García', usuario: 'ana.garcia', modulo: 'Introducción a HTML' },
  { nombre: 'Carlos Ruiz', usuario: 'carlos.ruiz', modulo: 'CSS Moderno' },
  { nombre: 'Laura Sánchez', usuario: 'laura.sanchez', modulo: 'Introducción a HTML' },
  { nombre: 'Miguel Torres', usuario: 'miguel.torres', modulo: 'JavaScript ES6+' },
  { nombre: 'Sofía Martín', usuario: 'sofia.martin', modulo: 'CSS Moderno' },
];

// ── Pantalla 1: Dashboard + Menú lateral ─────────────────────────────────
function ScreenDashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const DIAS_MINI = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const cells = [...Array(4).fill(null), ...Array.from({ length: 31 }, (_, i) => i + 1)];
  const tareasDia = new Set([25]);
  const todayNum = 17;

  return (
    <div style={{ position: 'relative' }}>
      {/* Overlay oscuro cuando el drawer está abierto */}
      {drawerOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }}
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mock del drawer lateral */}
      {drawerOpen && (
        <div className="demo-drawer-mock">
          <button className="demo-drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
          <nav className="demo-drawer-nav">
            <div className="demo-drawer-item demo-drawer-item-active">🏠 Área personal</div>
            <div className="demo-drawer-item">📅 Calendario</div>
            <div className="demo-drawer-item">📊 Calificaciones</div>
            <div className="demo-drawer-item">📋 Mis Entregas</div>
            <div className="demo-drawer-section-label">Mis cursos</div>
            <div className="demo-drawer-item">▸ Programación Web</div>
            <div className="demo-drawer-item">▸ Diseño UX</div>
          </nav>
        </div>
      )}

      {/* Barra superior con botón de menú */}
      <div className="demo-fake-header">
        <button className="demo-menu-trigger" onClick={() => setDrawerOpen(true)}>
          <span className="grid-dot" /><span className="grid-dot" /><span className="grid-dot" />
          <span className="grid-dot" /><span className="grid-dot" /><span className="grid-dot" />
          <span className="grid-dot" /><span className="grid-dot" /><span className="grid-dot" />
        </button>
        <span className="demo-fake-header-label">LearnHub</span>
        {!drawerOpen && (
          <span className="demo-menu-hint" onClick={() => setDrawerOpen(true)}>
            ← Pulsa aquí para abrir el menú
          </span>
        )}
      </div>

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
              <div className="curso-grupo">
                <div className="curso-grupo-header">
                  <span className="curso-grupo-nombre">Programación Web</span>
                  <span className="curso-grupo-count">4 módulos</span>
                </div>
                <div className="courses-grid">
                  {MODULOS_PW.slice(0, 3).map(m => (
                    <div key={m.id} className="course-card">
                      <div className="course-thumb" />
                      <span className="course-card-type">Programación Web</span>
                      <p className="course-card-name">{m.nombre}</p>
                    </div>
                  ))}
                </div>
              </div>
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
                    <span key={i} className={[
                      'mini-cal-cell',
                      !day ? 'mini-cal-empty' : '',
                      day === todayNum ? 'mini-cal-today' : '',
                      day && tareasDia.has(day) ? 'mini-cal-has-tarea' : '',
                    ].filter(Boolean).join(' ')}>
                      {day || ''}
                      {day && tareasDia.has(day) && <span className="mini-cal-dot" />}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Pantalla 2: Matricularse ──────────────────────────────────────────────
function ScreenMatricula() {
  const [modalOpen, setModalOpen] = useState(false);
  const [clave, setClave] = useState('');

  return (
    <div className="curso-page">
      <div className="curso-grid">
        <div className="curso-main">
          <div className="curso-card">
            <div className="curso-card-header">
              <div className="curso-title-block">
                <h1 className="curso-title">Programación Web</h1>
                <p className="curso-breadcrumb">Inicio <span className="bc-sep">/</span> Programación Web</p>
              </div>
            </div>

            <div className="subcarpetas-section">
              <div className="subcarpetas-header">Módulos</div>
              <div className="subcarpetas-list">
                {MODULOS_PW.map((mod, idx) => (
                  <div key={mod.id} className="subcarpeta-item">
                    <span className="subcarpeta-nombre">
                      <span className="subcarpeta-folder">📁</span>
                      {mod.nombre}
                    </span>
                    {idx === 0 ? (
                      <button className="btn-enroll-modulo enrolled" disabled>Desmatricularse</button>
                    ) : (
                      <button
                        className="btn-enroll-modulo"
                        onClick={() => { setModalOpen(true); setClave(''); }}
                      >
                        Matricularse
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="contenido-section">
              <p className="contenido-placeholder-txt">
                Selecciona un módulo en el que estés matriculado para ver su contenido.
              </p>
            </div>
          </div>
        </div>

        <div className="curso-sidebar">
          <div className="widget-box">
            <div className="widget-header">Próximas entregas</div>
            <ul className="sidebar-tasks-list">
              <li className="sidebar-task-item">
                <span className="sidebar-task-fecha">25 may</span>
                <span className="sidebar-task-titulo">📝 Crea tu primera página web</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal de matrícula */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Matricularse — CSS Moderno</h3>
            <div className="modal-field">
              <label>Clave de matrícula</label>
              <input
                type="text"
                value={clave}
                onChange={e => setClave(e.target.value)}
                placeholder="Introduce la clave que te dio el profesor..."
                autoFocus
              />
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 16px' }}>
              El profesor te proporcionará la clave para unirte al módulo.
            </p>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="btn-modal-ok" disabled={!clave.trim()}>Matricularse</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pantalla 3: Mis Entregas ──────────────────────────────────────────────
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
            <span>Inicio</span><span> / </span><span>Mis Entregas</span>
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
                  <td className={e.calificacion != null ? 'calificacion-cell calificacion-nota' : 'calificacion-cell calificacion-pendiente'}>
                    {e.calificacion != null ? `${e.calificacion}/10` : '—'}
                  </td>
                  <td><span className="btn-ver-recurso">Ver recurso</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Pantalla 4: Calificaciones ────────────────────────────────────────────
function ScreenCalificaciones() {
  const fmt = (f) => new Date(f).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="calificaciones-page">
      <div className="page-card">
        <div className="page-card-header">
          <h1 className="page-title">Programación Web</h1>
          <p className="page-breadcrumb">
            <span>Inicio</span><span> / </span><span>Programación Web</span><span> / </span><span>Calificaciones</span>
          </p>
        </div>
        <div className="grades-body">
          <div className="grades-username">Ana García</div>
          <table className="grades-table">
            <thead>
              <tr>
                <th>Tarea</th>
                <th>Módulo</th>
                <th>Fecha límite</th>
                <th>Nota</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {CALIFICACIONES.map((c, i) => (
                <tr key={i} className="gr-row-link">
                  <td className="gr-td-name">{c.titulo}</td>
                  <td className="gr-td-muted">{c.modulo}</td>
                  <td className="gr-td-muted">{fmt(c.fecha)}</td>
                  <td className={c.calificacion != null ? 'gr-grade gr-graded' : 'gr-grade'}>
                    {c.calificacion != null ? `${c.calificacion}/10` : '—'}
                  </td>
                  <td>
                    {c.entregado
                      ? <span className="gr-badge gr-badge-submitted">Entregada</span>
                      : <span className="gr-badge gr-badge-missing">Sin entregar</span>
                    }
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

// ── Pantalla 6: Participantes ─────────────────────────────────────────────
function ScreenParticipantes() {
  const [filtro, setFiltro] = useState('');
  const filtrados = PARTICIPANTES.filter(p =>
    `${p.nombre} ${p.usuario}`.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="participantes-page">
      <div className="page-card">
        <div className="page-card-header">
          <h1 className="page-title">Programación Web</h1>
          <p className="page-breadcrumb">
            <span>Inicio</span><span> / </span><span>Programación Web</span><span> / </span><span>Participantes</span>
          </p>
        </div>
        <div className="participantes-body">
          <h2 className="section-title">
            Participantes <span className="pt-count">{filtrados.length}</span>
          </h2>
          <div className="filter-box">
            <input
              type="text"
              placeholder="Buscar participante..."
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              className="filter-input"
            />
          </div>
          <table className="participantes-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Módulo</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={2} className="no-data">Sin resultados</td></tr>
              ) : (
                filtrados.map((p, i) => (
                  <tr key={i}>
                    <td>
                      <div className="pt-nombre-row">
                        <span className="pt-nombre">{p.nombre}</span>
                        <span className="pt-username">@{p.usuario}</span>
                      </div>
                    </td>
                    <td>
                      <div className="pt-modulos">
                        <span className="pt-modulo-tag">{p.modulo}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Pasos del tutorial ────────────────────────────────────────────────────
const STEPS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: '🏠',
    title: 'Tu panel principal',
    desc: 'El Dashboard es lo primero que ves al entrar. Muestra tus módulos recientes, las próximas entregas y el calendario. Desde aquí controlas todo.',
    callout: '☰ Haz clic en el icono de puntos (arriba a la izquierda) para abrir el menú lateral. Desde ahí navegas a todas las secciones: Calendario, Calificaciones, Entregas y tus cursos.',
    Screen: ScreenDashboard,
  },
  {
    key: 'matricula',
    label: 'Matricularse',
    icon: '🔑',
    title: 'Unirse a un módulo',
    desc: 'Para acceder al contenido de un módulo necesitas matricularte. El profesor te dará una clave. También puedes introducirla directamente desde el Dashboard.',
    callout: '🔑 Haz clic en "Matricularse" en cualquier módulo para ver el formulario de clave. Una vez matriculado, verás todos los recursos y tareas del módulo.',
    Screen: ScreenMatricula,
  },
  {
    key: 'entregas',
    label: 'Mis Entregas',
    icon: '📋',
    title: 'Historial de entregas',
    desc: 'Aquí tienes un registro de todas las tareas que has entregado con su estado y calificación. Haz clic en cualquier fila para ir al recurso.',
    callout: '🎯 La nota aparece sobre 10. Si ves "—" en la columna de calificación significa que el profesor aún no ha corregido tu entrega.',
    Screen: ScreenEntregas,
  },
  {
    key: 'calificaciones',
    label: 'Calificaciones',
    icon: '📊',
    title: 'Tu expediente del curso',
    desc: 'La vista de calificaciones agrupa todas las tareas entregables del curso con su estado y nota. Puedes ver qué has entregado y qué te falta.',
    callout: '📊 Las tareas marcadas en verde están entregadas. Las que aparecen en rojo aún no se han enviado. Haz clic en cualquier fila para ir directamente a la tarea.',
    Screen: ScreenCalificaciones,
  },
  {
    key: 'perfil',
    label: 'Perfil',
    icon: '👤',
    title: 'Tu perfil personal',
    desc: 'Gestiona tu información personal, cambia tu contraseña y ajusta las preferencias de la plataforma como idioma, notificaciones o formato del calendario.',
    callout: '⚙️ Desde el botón de configuración (arriba a la derecha de tu perfil) accedes a cambiar contraseña, preferencias de idioma, notificaciones y calendario.',
    Screen: ScreenPerfil,
  },
  {
    key: 'participantes',
    label: 'Participantes',
    icon: '👥',
    title: 'Compañeros de curso',
    desc: 'En la página de participantes ves todos los alumnos matriculados en el curso, agrupados por módulo. Puedes filtrar por nombre para encontrar a alguien.',
    callout: '🔍 Usa el buscador para filtrar participantes por nombre o usuario. Cada alumno muestra en qué módulo está matriculado.',
    Screen: ScreenParticipantes,
  },
];

// ── Callout flotante ──────────────────────────────────────────────────────
const DemoCallout = ({ text, step }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 250);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className={`demo-callout ${visible ? 'demo-callout-visible' : ''}`}>
      <div className="demo-callout-arrow" />
      <p className="demo-callout-text">{text}</p>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────
const Demo = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { Screen, title, desc, icon, callout } = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  const goNext = () => { if (!isLast) setStep(s => s + 1); };
  const goPrev = () => { if (!isFirst) setStep(s => s - 1); };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [step]);

  return (
    <div className="demo-page">

      <div className="demo-topbar">
        <div className="demo-topbar-left">
          <img src="/logo-buho.png" alt="LearnHub" className="demo-logo" />
          <span className="demo-brand">LearnHub</span>
          <span className="demo-badge">MODO DEMO</span>
        </div>
        <div className="demo-topbar-right">
          <span className="demo-keys-hint">← → para navegar</span>
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
            className={`demo-tab ${i === step ? 'demo-tab-active' : ''} ${i < step ? 'demo-tab-done' : ''}`}
            onClick={() => setStep(i)}
          >
            <span className="demo-tab-icon">{i < step ? '✓' : s.icon}</span>
            <span className="demo-tab-label">{s.label}</span>
          </button>
        ))}
      </div>

      <button className="demo-side-btn demo-side-btn-left" onClick={goPrev} disabled={isFirst} aria-label="Paso anterior">‹</button>
      <button className="demo-side-btn demo-side-btn-right" onClick={goNext} disabled={isLast} aria-label="Paso siguiente">›</button>

      <div className="demo-screen-wrap">
        <Screen key={step} />
      </div>

      <DemoCallout text={callout} step={step} />

      <div className="demo-footer">
        <div className="demo-footer-inner">
          <div className="demo-footer-text">
            <div className="demo-footer-step">{icon} Paso {step + 1} de {STEPS.length} — {title}</div>
            <p className="demo-footer-desc">{desc}</p>
          </div>
          <div className="demo-footer-nav">
            <div className="demo-dots">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`demo-dot ${i === step ? 'demo-dot-active' : i < step ? 'demo-dot-done' : ''}`}
                  onClick={() => setStep(i)}
                />
              ))}
            </div>
            <button className="demo-nav-btn" onClick={goPrev} disabled={isFirst}>← Anterior</button>
            {isLast ? (
              <button className="demo-nav-btn demo-nav-finish" onClick={() => navigate('/register')}>¡Crear mi cuenta! →</button>
            ) : (
              <button className="demo-nav-btn demo-nav-next" onClick={goNext}>Siguiente →</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
