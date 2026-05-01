import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PerfilHeader.css';

const PerfilHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
          {user ? `${user.nombre} ${user.apellidos}` : 'Nombre de Usuario'}
        </span>
      </div>

      <div className="ph-gear-wrapper" ref={gearRef}>
        <button className="ph-gear-btn" onClick={() => setGearOpen(o => !o)}>
          ⚙ <span className="ph-gear-arrow">▼</span>
        </button>
        {gearOpen && (
          <ul className="ph-gear-dropdown">
            <li onClick={() => goTo('/perfil/editar')}>Editar perfil</li>
            <li onClick={() => goTo('/perfil/cambiar-contrasena')}>Cambiar contraseña</li>
            <li onClick={() => goTo('/perfil/preferencias/calendario')}>
              Editar preferencias de calendario
            </li>
            <li onClick={() => goTo('/perfil/preferencias/notificaciones')}>
              Editar preferencias de notificación
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default PerfilHeader;
