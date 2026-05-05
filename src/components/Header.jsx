import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isGuiaOpen, setIsGuiaOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const languages = [
    { code: 'es', name: 'Español - Internacional' },
    { code: 'en', name: 'English (US)' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="header-container">

        {/* ── BARRA SUPERIOR (verde oscuro) ── */}
        <div className="top-bar">
          {/* Icono de rejilla — abre el panel de navegación */}
          <button className="grid-menu-btn" onClick={() => setNavOpen(true)} aria-label="Menú">
            <span className="grid-dot" /><span className="grid-dot" /><span className="grid-dot" />
            <span className="grid-dot" /><span className="grid-dot" /><span className="grid-dot" />
            <span className="grid-dot" /><span className="grid-dot" /><span className="grid-dot" />
          </button>

          <div className="top-right">
            {!user ? (
              <span className="not-logged-txt">Usted no se ha identificado.</span>
            ) : (
              <>
                <span className="icon-btn" title="Notificaciones">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C13.1046 22 14 21.1046 14 20H10C10 21.1046 10.8954 22 12 22ZM18 16V10C18 6.91 16.36 4.31 13.5 3.63V3C13.5 2.17 12.83 1.5 12 1.5C11.17 1.5 10.5 2.17 10.5 3V3.63C7.64 4.31 6 6.91 6 10V16L4 18V19H20V18L18 16Z" fill="#D3D3D3"/>
                  </svg>
                </span>

                {/* Mensajes o chatbot */}
                <span className="icon-btn" title="Mensajes">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#d3d3d3">
                    <path d="M4 4h16a2 2 0 012 2v9a2 2 0 01-2 2H9l-5 4v-4H4a2 2 0 01-2-2V6a2 2 0 012-2z"/>
                  </svg>
                </span>
                {/* ------------------ */}
                <span className="user-name">{user.nombre} {user.apellidos}</span>
                <div className="user-avatar-container">
                  <div className="user-avatar-circle">{user.nombre?.[0]?.toUpperCase()}</div>
                  <div className="user-dropdown-menu">
                    <Link to="/perfil">Mi perfil</Link>
                    <Link to="/dashboard">Área Personal</Link>
                    <Link to="/calificaciones">Calificaciones</Link>
                    <button onClick={handleLogout}>Cerrar sesión</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── BARRA LOGO (verde esmeralda) ── */}
        <div className="logo-bar">
          <div className="logo-section" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            <img src="/logo-buho.png" alt="Logo" className="main-logo" />
          </div>

          <div className="nav-menus">
            {/* Guía de Estudiante */}
            <div className="nav-item dropdown-container" onClick={() => { setIsGuiaOpen(o => !o); setIsLangOpen(false); }}>
              Guia de Estudiante de ciclos <span className="arrow-small">▼</span>
              {isGuiaOpen && (
                <ul className="dropdown-menu">
                  <li className="dropdown-item" onClick={() => { navigate('/dashboard'); setIsGuiaOpen(false); }}>Área Personal</li>
                  <li className="dropdown-item" onClick={() => { navigate('/calificaciones'); setIsGuiaOpen(false); }}>Mis Cursos</li>
                  <li className="dropdown-item" onClick={() => { navigate('/calendario'); setIsGuiaOpen(false); }}>Calendario</li>
                </ul>
              )}
            </div>

            {/* Idioma */}
            <div className="nav-item dropdown-container" onClick={() => { setIsLangOpen(o => !o); setIsGuiaOpen(false); }}>
              Idioma <span className="arrow-small">▼</span>
              {isLangOpen && (
                <ul className="dropdown-menu">
                  {languages.map(lang => (
                    <li key={lang.code} className="dropdown-item">
                      {lang.name} ({lang.code})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── PANEL DE NAVEGACIÓN DESLIZANTE ── */}
      {navOpen && (
        <div className="nav-overlay" onClick={() => setNavOpen(false)}>
          <div className="nav-drawer" onClick={e => e.stopPropagation()}>
            <button className="nav-drawer-close" onClick={() => setNavOpen(false)}>✕</button>
            <nav className="nav-drawer-links">
              <Link to="/dashboard" onClick={() => setNavOpen(false)}>
                <span className="nav-check-box" /> Área Personal
              </Link>
              <Link to="/calendario" onClick={() => setNavOpen(false)}>
                <span className="nav-check-box" /> Calendario
              </Link>
              <Link to="/calificaciones" onClick={() => setNavOpen(false)}>
                <span className="nav-check-box" /> Todos Mis Cursos
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
