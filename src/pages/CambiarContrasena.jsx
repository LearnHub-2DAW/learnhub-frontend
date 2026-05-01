import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../api/usuario.api';
import PerfilHeader from '../components/PerfilHeader';
import './CambiarContrasena.css';

const CambiarContrasena = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    contrasena_actual: '', nueva_contrasena: '', nueva_contrasena_repetida: '',
  });
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.contrasena_actual || !form.nueva_contrasena || !form.nueva_contrasena_repetida) {
      setServerError('Todos los campos son obligatorios');
      return;
    }
    if (form.nueva_contrasena !== form.nueva_contrasena_repetida) {
      setServerError('Las nuevas contraseñas no coinciden');
      return;
    }
    try {
      setSaving(true);
      setServerError(null);
      await changePassword({
        contrasena_actual: form.contrasena_actual,
        nueva_contrasena: form.nueva_contrasena,
      });
      alert('Contraseña actualizada correctamente');
      navigate('/perfil');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setSaving(false);
    }
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
              <input
                type="password"
                name="contrasena_actual"
                value={form.contrasena_actual}
                onChange={handleChange}
              />
              <span className="cp-info" title="Campo obligatorio">ℹ</span>
            </div>
          </div>

          <div className="cp-field">
            <label>Nueva contraseña <span className="required">*</span></label>
            <div className="cp-input-row">
              <input
                type="password"
                name="nueva_contrasena"
                value={form.nueva_contrasena}
                onChange={handleChange}
              />
              <span className="cp-info" title="Campo obligatorio">ℹ</span>
            </div>
          </div>

          <div className="cp-field">
            <label>Nueva contraseña (de nuevo) <span className="required">*</span></label>
            <div className="cp-input-row">
              <input
                type="password"
                name="nueva_contrasena_repetida"
                value={form.nueva_contrasena_repetida}
                onChange={handleChange}
              />
              <span className="cp-info" title="Campo obligatorio">ℹ</span>
            </div>
          </div>

          {serverError && <p className="cp-error">{serverError}</p>}

          <div className="cp-actions">
            <button type="submit" className="btn-guardar" disabled={saving}>
              {saving ? 'Guardando...' : 'GUARDAR CAMBIOS'}
            </button>
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
