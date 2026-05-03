import { useNavigate } from 'react-router-dom';
import PerfilHeader from '../components/PerfilHeader';
import './CambiarContrasena.css';

const CambiarContrasena = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Endpoint no disponible aún en el backend
    alert('El cambio de contraseña estará disponible próximamente.');
  };

  return (
    <div className="cambiar-pass-page">
      <PerfilHeader />

      <div className="cp-form-card">
        <h3 className="cp-form-title">Cambiar contraseña</h3>

        <form onSubmit={handleSubmit}>
          <div className="cp-field">
            <label>Contraseña actual <span className="required">*</span></label>
            <div className="cp-input-row">
              <input type="password" name="contrasena_actual" />
              <span className="cp-info" title="Campo obligatorio">ℹ</span>
            </div>
          </div>

          <div className="cp-field">
            <label>Nueva contraseña <span className="required">*</span></label>
            <div className="cp-input-row">
              <input type="password" name="nueva_contrasena" />
              <span className="cp-info" title="Campo obligatorio">ℹ</span>
            </div>
          </div>

          <div className="cp-field">
            <label>Nueva contraseña (de nuevo) <span className="required">*</span></label>
            <div className="cp-input-row">
              <input type="password" name="nueva_contrasena_repetida" />
              <span className="cp-info" title="Campo obligatorio">ℹ</span>
            </div>
          </div>

          <div className="cp-actions">
            <button type="submit" className="btn-guardar">GUARDAR CAMBIOS</button>
            <button type="button" className="btn-cancelar" onClick={() => navigate('/perfil')}>
              CANCELAR
            </button>
          </div>

          <p className="cp-required-note">
            <span className="cp-info">ℹ</span> En este formulario hay campos obligatorios
          </p>
        </form>
      </div>
    </div>
  );
};

export default CambiarContrasena;
