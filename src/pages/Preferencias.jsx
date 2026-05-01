import { useNavigate } from 'react-router-dom';
import PerfilHeader from '../components/PerfilHeader';
import './Preferencias.css';

const Preferencias = () => {
  const navigate = useNavigate();

  return (
    <div className="preferencias-page">
      <PerfilHeader />

      <div className="preferencias-body">
        <div className="pref-card">
          <h3 className="pref-card-title">Cuenta de Usuario</h3>
          <ul className="pref-links">
            <li onClick={() => navigate('/perfil/editar')}>Editar perfil</li>
            <li onClick={() => navigate('/perfil/cambiar-contrasena')}>Cambiar contraseña</li>
            <li onClick={() => navigate('/perfil/preferencias/calendario')}>
              Editar preferencias de calendario
            </li>
            <li onClick={() => navigate('/perfil/preferencias/notificaciones')}>
              Editar preferencias de notificación
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Preferencias;
