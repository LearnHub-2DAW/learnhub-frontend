import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import PerfilHeader from '../../components/PerfilHeader';
import './EditarPerfil.css';

const EditarPerfil = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tr } = useLang();
  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    apellidos: user?.apellidos || '',
    correo_electronico: user?.correo_electronico || '',
    ciudad: '',
    pais: '',
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('La edición de perfil estará disponible próximamente.');
  };

  return (
    <div className="editar-perfil-page">
      <PerfilHeader />

      <div className="ep-form-card">
        <h3 className="ep-form-title">{user?.nombre_usuario || tr('r_username')}</h3>

        <form onSubmit={handleSubmit}>
          <div className="ep-section">
            <h4 className="ep-section-label">{tr('ep_general')}</h4>

            <div className="ep-field">
              <label>{tr('r_name')} <span className="required">*</span></label>
              <div className="ep-input-row">
                <input name="nombre" value={form.nombre} onChange={handleChange} />
                <span className="ep-info" title={tr('error_required')}>ℹ</span>
              </div>
            </div>

            <div className="ep-field">
              <label>{tr('ep_surnameLabel')} <span className="required">*</span></label>
              <div className="ep-input-row">
                <input name="apellidos" value={form.apellidos} onChange={handleChange} />
                <span className="ep-info" title={tr('error_required')}>ℹ</span>
              </div>
            </div>

            <div className="ep-field">
              <label>{tr('ep_emailAddr')} <span className="required">*</span></label>
              <div className="ep-input-row">
                <input
                  type="email"
                  name="correo_electronico"
                  value={form.correo_electronico}
                  onChange={handleChange}
                />
                <span className="ep-info" title={tr('error_required')}>ℹ</span>
              </div>
            </div>

            <div className="ep-field">
              <label>{tr('r_city')}</label>
              <input name="ciudad" value={form.ciudad} onChange={handleChange} />
            </div>

            <div className="ep-field">
              <label>{tr('r_country')}</label>
              <input name="pais" value={form.pais} onChange={handleChange} />
            </div>
          </div>

          <div className="ep-section">
            <h4 className="ep-section-label">{tr('ep_userImage')}</h4>
            <div className="ep-field">
              <label>{tr('ep_currentImage')}</label>
              <button type="button" className="ep-img-btn">{tr('ep_currentImage')}</button>
            </div>
            <div className="ep-field">
              <label>{tr('ep_newImage')}</label>
              <button type="button" className="ep-img-btn">{tr('ep_newImage')}</button>
            </div>
          </div>

          <div className="ep-actions">
            <button type="submit" className="btn-guardar">
              {tr('ep_updateInfo')}
            </button>
            <button type="button" className="btn-cancelar" onClick={() => navigate('/perfil')}>
              {tr('cancel')}
            </button>
          </div>

          <p className="ep-required-note">
            <span className="ep-info">ℹ</span> {tr('ep_requiredNote')}
          </p>
        </form>
      </div>
    </div>
  );
};

export default EditarPerfil;
