import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLang } from '../../context/LangContext';
import { updatePerfil } from '../../api/usuario.api';
import { getFileUrl } from '../../api/axios';
import PerfilHeader from '../../components/PerfilHeader';
import './EditarPerfil.css';

const EditarPerfil = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const { tr } = useLang();

  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    apellidos: user?.apellidos || '',
    correo_electronico: user?.correo_electronico || '',
    ciudad: user?.ciudad || '',
    pais: user?.pais || '',
    url_imagen_perfil: user?.url_imagen_perfil || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return setError(tr('error_required'));
    setSaving(true);
    setError('');
    try {
      const res = await updatePerfil(form);
      updateUser({ ...user, ...res.data });
      toast(tr('ep_saved'));
      navigate('/perfil');
    } catch (err) {
      setError(err.response?.data?.message || tr('ep_errorSave'));
    } finally {
      setSaving(false);
    }
  };

  const currentImgUrl = user?.url_imagen_perfil
    ? (user.url_imagen_perfil.startsWith('http') ? user.url_imagen_perfil : getFileUrl(user.url_imagen_perfil))
    : null;

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
            {currentImgUrl && (
              <div className="ep-field">
                <label>{tr('ep_currentImage')}</label>
                <img
                  src={currentImgUrl}
                  alt="avatar"
                  className="ep-current-img"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
            <div className="ep-field">
              <label>{tr('ep_newImage')}</label>
              <input
                type="url"
                name="url_imagen_perfil"
                value={form.url_imagen_perfil}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
          </div>

          {error && <p className="ep-error">{error}</p>}

          <div className="ep-actions">
            <button type="submit" className="btn-guardar" disabled={saving}>
              {saving ? tr('saving') : tr('ep_updateInfo')}
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
