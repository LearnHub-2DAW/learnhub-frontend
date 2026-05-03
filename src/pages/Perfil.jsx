import { useAuth } from '../context/AuthContext';
import PerfilHeader from '../components/PerfilHeader';
import './Perfil.css';

const Perfil = () => {
  const { user } = useAuth();

  return (
    <div className="perfil-page">
      <PerfilHeader />

      <div className="perfil-grid">
        {/* Columna izquierda */}
        <div className="perfil-col">
          <div className="info-card">
            <h3 className="info-card-title">Detalles de usuario</h3>
            <div className="info-row">
              <span className="info-label">Nombre de usuario</span>
              <span className="info-value">{user?.nombre_usuario || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Dirección de correo</span>
              <span className="info-value">{user?.correo_electronico || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">País</span>
              <span className="info-value">—</span>
            </div>
            <div className="info-row">
              <span className="info-label">Ciudad</span>
              <span className="info-value">—</span>
            </div>
          </div>

          <div className="info-card">
            <h3 className="info-card-title">Detalles del curso</h3>
            <div className="info-row">
              <span className="info-label">Perfiles de curso</span>
              <span className="info-value">{user?.roles?.join(', ') || '—'}</span>
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="perfil-col">
          <div className="info-card">
            <h3 className="info-card-title">Actividad de accesos</h3>
            <div className="info-row">
              <span className="info-label">Primer acceso del sitio</span>
              <span className="info-value">—</span>
            </div>
            <div className="info-row">
              <span className="info-label">Último acceso del sitio</span>
              <span className="info-value">—</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
