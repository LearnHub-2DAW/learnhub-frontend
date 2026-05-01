import { useState, useEffect } from 'react';
import PerfilHeader from '../components/PerfilHeader';
import { getMe } from '../api/usuario.api';
import './Perfil.css';

const Perfil = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(res => setPerfil(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Cargando perfil...</div>;

  return (
    <div className="perfil-page">
      <PerfilHeader />

      <div className="perfil-grid">
        {/* Columna izquierda */}
        <div className="perfil-col">
          <div className="info-card">
            <h3 className="info-card-title">Detalles de usuario</h3>
            <div className="info-row">
              <span className="info-label">Dirección de correo</span>
              <span className="info-value">{perfil?.correo_electronico || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">País</span>
              <span className="info-value">{perfil?.pais || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Ciudad</span>
              <span className="info-value">{perfil?.ciudad || '—'}</span>
            </div>
          </div>

          <div className="info-card">
            <h3 className="info-card-title">Detalles del curso</h3>
            <div className="info-row">
              <span className="info-label">Perfiles de curso</span>
              <span className="info-value">—</span>
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
