import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LangContext';
import { useChatDrawer } from '../context/ChatDrawerContext';
import { getCursos, getModulosByCurso } from '../api/cursos.api';
import { getMisModulos } from '../api/usuario.api';
import './Header.css';

const LANG_NAMES = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
};

const Header = () => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isGuiaOpen, setIsGuiaOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const { user, logout } = useAuth();
  const { dark, toggleDark } = useTheme();
  const { lang, setLang, tr } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const { toggle: toggleChat } = useChatDrawer();

  const isStaff = user?.roles?.includes('admin') || user?.roles?.includes('profesor');
  const cursoIdMatch = location.pathname.match(/^\/curso\/(\d+)/);
  const currentCursoId = cursoIdMatch ? Number(cursoIdMatch[1]) : null;

  const [navCursos, setNavCursos] = useState([]);
  const [navModulos, setNavModulos] = useState({});
  const [expandedCursos, setExpandedCursos] = useState(new Set());
  const loadingIds = useRef(new Set());

  const loadModulos = (cursoId) => {
    if (navModulos[cursoId] || loadingIds.current.has(cursoId)) return;
    loadingIds.current.add(cursoId);
    getModulosByCurso(cursoId)
      .then(res => setNavModulos(prev => ({ ...prev, [cursoId]: res.data })))
      .catch(() => setNavModulos(prev => ({ ...prev, [cursoId]: [] })))
      .finally(() => loadingIds.current.delete(cursoId));
  };

  // Load enrolled courses when user logs in
  useEffect(() => {
    if (!user) { setNavCursos([]); setNavModulos({}); setExpandedCursos(new Set()); return; }
    const load = async () => {
      try {
        if (isStaff) {
          const res = await getCursos();
          setNavCursos(res.data);
        } else {
          const [cursosRes, misRes] = await Promise.all([
            getCursos(),
            getMisModulos().catch(() => ({ data: [] })),
          ]);
          const ids = new Set((misRes.data || []).map(m => m.id_curso));
          setNavCursos(cursosRes.data.filter(c => ids.has(c.id)));
        }
      } catch {}
    };
    load();
  }, [user?.id]);

  // Auto-expand current course and load its modules
  useEffect(() => {
    if (!currentCursoId) return;
    setExpandedCursos(prev => new Set([...prev, currentCursoId]));
    loadModulos(currentCursoId);
  }, [currentCursoId]);

  // If only one course, always expand it
  useEffect(() => {
    if (navCursos.length === 1) {
      const id = navCursos[0].id;
      setExpandedCursos(new Set([id]));
      loadModulos(id);
    }
  }, [navCursos]);

  const toggleCurso = (cursoId) => {
    setExpandedCursos(prev => {
      const next = new Set(prev);
      if (next.has(cursoId)) { next.delete(cursoId); }
      else { next.add(cursoId); loadModulos(cursoId); }
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="header-container">

        {/* ── BARRA SUPERIOR ── */}
        <div className="top-bar">
          <button className="grid-menu-btn" onClick={() => setNavOpen(true)} aria-label="Menú">
            <span className="grid-dot" /><span className="grid-dot" /><span className="grid-dot" />
            <span className="grid-dot" /><span className="grid-dot" /><span className="grid-dot" />
            <span className="grid-dot" /><span className="grid-dot" /><span className="grid-dot" />
          </button>

          <div className="top-right">
            {!user ? (
              <span className="not-logged-txt">{tr('h_notLoggedIn')}</span>
            ) : (
              <>
                <span className="icon-btn" title={tr('h_notifications') || 'Notificaciones'}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C13.1046 22 14 21.1046 14 20H10C10 21.1046 10.8954 22 12 22ZM18 16V10C18 6.91 16.36 4.31 13.5 3.63V3C13.5 2.17 12.83 1.5 12 1.5C11.17 1.5 10.5 2.17 10.5 3V3.63C7.64 4.31 6 6.91 6 10V16L4 18V19H20V18L18 16Z" fill="#D3D3D3"/>
                  </svg>
                </span>
                <span className="icon-btn" title={tr('h_messages') || 'Mensajes'} onClick={toggleChat} style={{ cursor: 'pointer' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#d3d3d3">
                    <path d="M4 4h16a2 2 0 012 2v9a2 2 0 01-2 2H9l-5 4v-4H4a2 2 0 01-2-2V6a2 2 0 012-2z"/>
                  </svg>
                </span>
                <div className="user-avatar-container">
                  <span className="user-name">{user.nombre} {user.apellidos}</span>
                  <div className="user-avatar-circle">{user.nombre?.[0]?.toUpperCase()}</div>
                  <div className="user-dropdown-menu">
                    <Link to="/perfil">{tr('h_myProfile')}</Link>
                    <Link to="/dashboard">{tr('h_personalArea')}</Link>
                    <Link to="/calificaciones">{tr('h_grades')}</Link>
                    <Link to="/mis-entregas">{tr('me_title')}</Link>
                    {user?.roles?.includes('admin') && (
                      <Link to="/admin/usuarios">{tr('nav_adminPanel')}</Link>
                    )}
                    <button onClick={handleLogout}>{tr('h_logout')}</button>
                  </div>
                </div>
              </>
            )}

            {/* Toggle modo oscuro */}
            <button
              className="dark-toggle-btn"
              onClick={toggleDark}
              title={dark ? 'Modo claro' : 'Modo oscuro'}
              aria-label="Toggle dark mode"
            >
              {dark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* ── BARRA LOGO ── */}
        <div className="logo-bar">
          <div className="logo-section" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            <img src="/logo-buho.png" alt="Logo" className="main-logo" />
          </div>

          <div className="nav-menus">
            {/* Guía de Estudiante */}
            <div className="nav-item dropdown-container" onClick={() => { setIsGuiaOpen(o => !o); setIsLangOpen(false); }}>
              <div className="nav-trigger">
                {tr('h_guide')} <span className="arrow-small">▼</span>
              </div>
              {isGuiaOpen && (
                <ul className="dropdown-menu">
                  <li className="dropdown-item" onClick={() => { navigate('/dashboard'); setIsGuiaOpen(false); }}>{tr('h_personalArea')}</li>
                  <li className="dropdown-item" onClick={() => { navigate('/calificaciones'); setIsGuiaOpen(false); }}>{tr('h_myCourses')}</li>
                  <li className="dropdown-item" onClick={() => { navigate('/calendario'); setIsGuiaOpen(false); }}>{tr('h_calendar')}</li>
                </ul>
              )}
            </div>

            {/* Idioma */}
            <div className="nav-item dropdown-container" onClick={() => { setIsLangOpen(o => !o); setIsGuiaOpen(false); }}>
              <div className="nav-trigger">
                {tr('h_language')} ({LANG_NAMES[lang]}) <span className="arrow-small">▼</span>
              </div>
              {isLangOpen && (
                <ul className="dropdown-menu">
                  {Object.entries(LANG_NAMES).map(([code, name]) => (
                    <li
                      key={code}
                      className={`dropdown-item${lang === code ? ' dropdown-item-active' : ''}`}
                      onClick={() => { setLang(code); setIsLangOpen(false); }}
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── DRAWER DE NAVEGACIÓN ── */}
      {navOpen && (
        <div className="nav-overlay" onClick={() => setNavOpen(false)}>
          <div className="nav-drawer" onClick={e => e.stopPropagation()}>
            <button className="nav-drawer-close" onClick={() => setNavOpen(false)}>✕</button>
            <nav className="nav-drawer-links">
              <Link to="/dashboard" onClick={() => setNavOpen(false)}>
                <span className="nav-check-box" /> {tr('nav_personalArea')}
              </Link>
              <Link to="/calendario" onClick={() => setNavOpen(false)}>
                <span className="nav-check-box" /> {tr('nav_calendar')}
              </Link>
              <Link to="/calificaciones" onClick={() => setNavOpen(false)}>
                <span className="nav-check-box" /> {tr('nav_allCourses')}
              </Link>
              <Link to="/mis-entregas" onClick={() => setNavOpen(false)}>
                <span className="nav-check-box" /> {tr('me_title')}
              </Link>
              {user?.roles?.includes('admin') && (
                <Link to="/admin/usuarios" onClick={() => setNavOpen(false)}>
                  <span className="nav-check-box" /> {tr('nav_adminPanel')}
                </Link>
              )}

              {navCursos.length > 0 && (
                <div className="nav-cursos-section">
                  <div className="nav-cursos-label">MIS CURSOS</div>
                  {navCursos.map(curso => {
                    const isExpanded = expandedCursos.has(curso.id);
                    const isCurrent = currentCursoId === curso.id;
                    const mods = navModulos[curso.id];
                    const single = navCursos.length === 1;
                    return (
                      <div key={curso.id} className="nav-curso-group">
                        <div
                          className={`nav-curso-row ${isCurrent ? 'nav-curso-active' : ''}`}
                          onClick={() => {
                            if (single) {
                              navigate(`/curso/${curso.id}`);
                              setNavOpen(false);
                            } else {
                              toggleCurso(curso.id);
                            }
                          }}
                        >
                          <span className="nav-check-box" />
                          <span className="nav-curso-nombre">{curso.nombre}</span>
                          {!single && (
                            <span className="nav-expand-icon">{isExpanded ? '▾' : '▸'}</span>
                          )}
                        </div>
                        {isExpanded && (
                          <div className="nav-modulos-list">
                            {!mods ? (
                              <span className="nav-modulo-placeholder">…</span>
                            ) : mods.length === 0 ? (
                              <span className="nav-modulo-placeholder">Sin módulos</span>
                            ) : (
                              mods.map(mod => (
                                <div
                                  key={mod.id}
                                  className={`nav-modulo-row ${currentCursoId === curso.id ? 'nav-modulo-in-curso' : ''}`}
                                  onClick={() => {
                                    navigate(`/curso/${curso.id}`, { state: { activarModuloId: mod.id } });
                                    setNavOpen(false);
                                  }}
                                >
                                  {mod.nombre}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
