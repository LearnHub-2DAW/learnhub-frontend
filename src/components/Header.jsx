import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const languages = [
    { code: 'es', name: 'Español - Internacional' },
    { code: 'en', name: 'English (US)' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' }
  ];

  return (
    <header className="header-container">
      {/* BARRA SUPERIOR (Verde oscuro) */}
      <div className="top-bar">
        <div className="top-right">
          {!user ? (
            <span className="not-logged-txt">Usted no se ha identificado.</span>
          ) : (
            <>
              <span className="icon-btn">🔔</span>
              <span className="icon-btn">💬</span>
              <span className="user-name">{`${user.nombre} ${user.apellidos}`}</span>
              <div className="user-avatar-container">
                <img src="/default-avatar.png" alt="User" className="user-avatar" />
                <span className="arrow-down">▼</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* BARRA LOGO (Verde Esmeralda) */}
      <div className="logo-bar">
        <div className="logo-section" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/logo-buho.png" alt="Logo" className="main-logo" />
        </div>

        <div className="nav-menus">
          {/* DESPLEGABLE DE IDIOMAS */}
          <div 
            className="nav-item dropdown-container" 
            onClick={() => setIsLangOpen(!isLangOpen)}
          >
            Español - Internacional (es) <span className="arrow-small">▼</span>
            
            {isLangOpen && (
              <ul className="dropdown-menu">
                {languages.map((lang) => (
                  <li 
                    key={lang.code} 
                    className="dropdown-item"
                    onClick={() => console.log(`Idioma: ${lang.code}`)}
                  >
                    {lang.name} ({lang.code})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;