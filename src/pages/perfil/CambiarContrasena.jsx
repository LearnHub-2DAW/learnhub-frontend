import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLang } from '../../context/LangContext';
import { changePassword } from '../../api/usuario.api';
import PerfilHeader from '../../components/PerfilHeader';
import './CambiarContrasena.css';

const CambiarContrasena = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { tr } = useLang();

  const [form, setForm] = useState({
    contrasena_actual: '',
    nueva_contrasena: '',
    nueva_contrasena_repetida: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (!/[A-Z]/.test(pwd)) return 'La contraseña debe contener al menos una letra mayúscula';
    if (!/[a-z]/.test(pwd)) return 'La contraseña debe contener al menos una letra minúscula';
    if (!/[0-9]/.test(pwd)) return 'La contraseña debe contener al menos un número';
    if (!/[^A-Za-z0-9]/.test(pwd)) return 'La contraseña debe contener al menos un carácter especial';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.contrasena_actual || !form.nueva_contrasena || !form.nueva_contrasena_repetida) {
      return setError(tr('error_required'));
    }
    const pwdError = validatePassword(form.nueva_contrasena);
    if (pwdError) return setError(pwdError);
    if (form.nueva_contrasena !== form.nueva_contrasena_repetida) {
      return setError(tr('chpwd_mismatch'));
    }
    setSaving(true);
    setError('');
    try {
      await changePassword({
        contrasena_actual: form.contrasena_actual,
        nueva_contrasena: form.nueva_contrasena,
      });
      toast(tr('chpwd_saved'));
      navigate('/perfil');
    } catch (err) {
      setError(err.response?.data?.message || tr('chpwd_errorSave'));
    } finally {
      setSaving(false);
    }
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
              <input
                type="password"
                name="contrasena_actual"
                value={form.contrasena_actual}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <span className="cp-info" title={tr('error_required')}>ℹ</span>
            </div>
          </div>

          <div className="cp-field">
            <label>{tr('chpwd_new')} <span className="required">*</span></label>
            <div className="cp-input-row">
              <input
                type="password"
                name="nueva_contrasena"
                value={form.nueva_contrasena}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <span className="cp-info" title={tr('error_required')}>ℹ</span>
            </div>
          </div>

          <div className="cp-field">
            <label>{tr('chpwd_newAgain')} <span className="required">*</span></label>
            <div className="cp-input-row">
              <input
                type="password"
                name="nueva_contrasena_repetida"
                value={form.nueva_contrasena_repetida}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <span className="cp-info" title={tr('error_required')}>ℹ</span>
            </div>
          </div>

          {error && <p className="cp-error">{error}</p>}

          <div className="cp-actions">
            <button type="submit" className="btn-guardar" disabled={saving}>
              {saving ? tr('saving') : tr('ae_saveChanges')}
            </button>
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
