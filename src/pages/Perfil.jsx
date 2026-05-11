import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import PerfilHeader from '../components/PerfilHeader';
import './Perfil.css';

const Perfil = () => {
  const { user } = useAuth();
  const { tr } = useLang();

  return (
    <div className="perfil-page">
      <PerfilHeader />

      <div className="perfil-grid">
        <div className="perfil-col">
          <div className="info-card">
            <h3 className="info-card-title">{tr('pf_userDetails')}</h3>
            <div className="info-row">
              <span className="info-label">{tr('r_username')}</span>
              <span className="info-value">{user?.nombre_usuario || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{tr('pf_emailAddr')}</span>
              <span className="info-value">{user?.correo_electronico || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{tr('r_country')}</span>
              <span className="info-value">—</span>
            </div>
            <div className="info-row">
              <span className="info-label">{tr('r_city')}</span>
              <span className="info-value">—</span>
            </div>
          </div>

          <div className="info-card">
            <h3 className="info-card-title">{tr('pf_courseDetails')}</h3>
            <div className="info-row">
              <span className="info-label">{tr('pf_courseProfiles')}</span>
              <span className="info-value">{user?.roles?.join(', ') || '—'}</span>
            </div>
          </div>
        </div>

        <div className="perfil-col">
          <div className="info-card">
            <h3 className="info-card-title">{tr('pf_accessActivity')}</h3>
            <div className="info-row">
              <span className="info-label">{tr('pf_firstAccess')}</span>
              <span className="info-value">—</span>
            </div>
            <div className="info-row">
              <span className="info-label">{tr('pf_lastAccess')}</span>
              <span className="info-value">—</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
