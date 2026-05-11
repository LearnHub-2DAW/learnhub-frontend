import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import PerfilHeader from '../components/PerfilHeader';
import './CambiarContrasena.css';

const CambiarContrasena = () => {
  const navigate = useNavigate();
  const { tr } = useLang();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('El cambio de contraseña estará disponible próximamente.');
  };

  return (
    <div className="cambiar-pass-page">
      <PerfilHeader />

      <div className="cp-form-card">
        <h3 className="cp-form-title">{tr('chpwd_title')}</h3>

        <form onSubmit={handleSubmit}>
          <div className="cp-field">
            <label>{tr('chpwd_current')} <span className="required">*</span></label>
            <div className="cp-input-row">
              <input type="password" name="contrasena_actual" />
              <span className="cp-info" title={tr('error_required')}>ℹ</span>
            </div>
          </div>

          <div className="cp-field">
            <label>{tr('chpwd_new')} <span className="required">*</span></label>
            <div className="cp-input-row">
              <input type="password" name="nueva_contrasena" />
              <span className="cp-info" title={tr('error_required')}>ℹ</span>
            </div>
          </div>

          <div className="cp-field">
            <label>{tr('chpwd_newAgain')} <span className="required">*</span></label>
            <div className="cp-input-row">
              <input type="password" name="nueva_contrasena_repetida" />
              <span className="cp-info" title={tr('error_required')}>ℹ</span>
            </div>
          </div>

          <div className="cp-actions">
            <button type="submit" className="btn-guardar">{tr('ae_saveChanges')}</button>
            <button type="button" className="btn-cancelar" onClick={() => navigate('/perfil')}>
              {tr('cancel')}
            </button>
          </div>

          <p className="cp-required-note">
            <span className="cp-info">ℹ</span> {tr('ep_requiredNote')}
          </p>
        </form>
      </div>
    </div>
  );
};

export default CambiarContrasena;
