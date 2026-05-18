import { useState, useRef, useEffect } from 'react';
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
  });
  const [imagenFile, setImagenFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImagenFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return setError(tr('error_required'));
    setSaving(true);
    setError('');
    try {
      let payload;
      if (imagenFile) {
        const formData = new FormData();
        formData.append('nombre', form.nombre);
        if (form.apellidos) formData.append('apellidos', form.apellidos);
        if (form.ciudad) formData.append('ciudad', form.ciudad);
        if (form.pais) formData.append('pais', form.pais);
        formData.append('imagen', imagenFile);
        payload = formData;
      } else {
        payload = {
          nombre: form.nombre,
          ...(form.apellidos && { apellidos: form.apellidos }),
          ...(form.ciudad && { ciudad: form.ciudad }),
          ...(form.pais && { pais: form.pais }),
        };
      }
      const res = await updatePerfil(payload);
      updateUser({ ...user, ...res.data });
      toast(tr('ep_saved'));
      navigate('/perfil');
    } catch (err) {
      setError(err.response?.data?.errors?.[0] || err.response?.data?.error || err.response?.data?.message || tr('ep_errorSave'));
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
              <label>{tr('ep_surnameLabel')}</label>
              <div className="ep-input-row">
                <input name="apellidos" value={form.apellidos} onChange={handleChange} />
                <span className="ep-info" title={tr('error_required')}>ℹ</span>
              </div>
            </div>

            <div className="ep-field">
              <label>{tr('ep_emailAddr')}</label>
              <div className="ep-input-row">
                <input
                  type="email"
                  name="correo_electronico"
                  value={form.correo_electronico}
                  readOnly
                  className="ep-input-readonly"
                />
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
              <label>{tr('ep_newImage')}</label>
              <div>
                <div className="ep-img-upload" onClick={() => fileInputRef.current?.click()}>
                  {previewUrl || currentImgUrl ? (
                    <img
                      src={previewUrl || currentImgUrl}
                      alt="avatar"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="ep-img-placeholder">
                      <span>+</span>
                      <p>Subir</p>
                    </div>
                  )}
                  <div className="ep-img-overlay">
                    <span>{tr('ep_changeImage') || 'Cambiar'}</span>
                  </div>
                </div>
                {imagenFile && <p className="ep-img-filename">{imagenFile.name}</p>}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
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
