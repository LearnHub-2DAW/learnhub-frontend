import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import './PerfilHeader.css';

const PerfilHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tr } = useLang();
  const [gearOpen, setGearOpen] = useState(false);
  const gearRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (gearRef.current && !gearRef.current.contains(e.target)) {
        setGearOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initial = user?.nombre?.[0]?.toUpperCase() || 'U';

  const goTo = (path) => {
    setGearOpen(false);
    navigate(path);
  };

  return (
    <div className="perfil-header-card">
      <div className="ph-user-info">
        <div className="ph-avatar">{initial}</div>
        <span className="ph-name">
          {user ? `${user.nombre} ${user.apellidos}` : '—'}
        </span>
      </div>

      <div className="ph-gear-wrapper" ref={gearRef}>
        <button className="ph-gear-btn" onClick={() => setGearOpen(o => !o)}>
          ⚙ <span className="ph-gear-arrow">▼</span>
        </button>
        {gearOpen && (
          <ul className="ph-gear-dropdown">
            <li onClick={() => goTo('/perfil/editar')}>{tr('pref_editProfile')}</li>
            <li onClick={() => goTo('/perfil/cambiar-contrasena')}>{tr('pref_changePassword')}</li>
            <li onClick={() => goTo('/perfil/preferencias/calendario')}>{tr('pref_calendarPref')}</li>
            <li onClick={() => goTo('/perfil/preferencias/notificaciones')}>{tr('pref_notifPref')}</li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default PerfilHeader;
