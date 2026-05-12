import { useNavigate } from 'react-router-dom';
import { useLang } from '../../context/LangContext';
import PerfilHeader from '../../components/PerfilHeader';
import './Preferencias.css';

const Preferencias = () => {
  const navigate = useNavigate();
  const { tr } = useLang();

  return (
    <div className="preferencias-page">
      <PerfilHeader />

      <div className="preferencias-body">
        <div className="pref-card">
          <h3 className="pref-card-title">{tr('pref_userAccount')}</h3>
          <ul className="pref-links">
            <li onClick={() => navigate('/perfil/editar')}>{tr('pref_editProfile')}</li>
            <li onClick={() => navigate('/perfil/cambiar-contrasena')}>{tr('pref_changePassword')}</li>
            <li onClick={() => navigate('/perfil/preferencias/calendario')}>{tr('pref_calendarPref')}</li>
            <li onClick={() => navigate('/perfil/preferencias/notificaciones')}>{tr('pref_notifPref')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Preferencias;
