import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMe, updatePerfil } from '../api/usuario.api';
import PerfilHeader from '../components/PerfilHeader';
import './EditarPerfil.css';

const EditarPerfil = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [form, setForm] = useState({
    nombre: '', apellidos: '', correo_electronico: '', ciudad: '', pais: '',
  });

  useEffect(() => {
    getMe()
      .then(res => {
        const u = res.data;
        setForm({
          nombre: u.nombre || '',
          apellidos: u.apellidos || '',
          correo_electronico: u.correo_electronico || '',
          ciudad: u.ciudad || '',
          pais: u.pais || '',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.apellidos || !form.correo_electronico) {
      setServerError('Los campos marcados con (*) son obligatorios');
      return;
    }
    try {
      setSaving(true);
      setServerError(null);
      await updatePerfil(form);
      navigate('/perfil');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loading">Cargando...</div>;

  return (
    <div className="editar-perfil-page">
      <PerfilHeader />

      <div className="ep-form-card">
        <h3 className="ep-form-title">{user?.nombre_usuario || 'Nombre de usuario'}</h3>

        <form onSubmit={handleSubmit}>
          <div className="ep-section">
            <h4 className="ep-section-label">General</h4>

            <div className="ep-field">
              <label>Nombre <span className="required">*</span></label>
              <div className="ep-input-row">
                <input name="nombre" value={form.nombre} onChange={handleChange} />
                <span className="ep-info" title="Campo obligatorio">ℹ</span>
              </div>
            </div>

            <div className="ep-field">
              <label>Apellido(s) <span className="required">*</span></label>
              <div className="ep-input-row">
                <input name="apellidos" value={form.apellidos} onChange={handleChange} />
                <span className="ep-info" title="Campo obligatorio">ℹ</span>
              </div>
            </div>

            <div className="ep-field">
              <label>Dirección de correo <span className="required">*</span></label>
              <div className="ep-input-row">
                <input
                  type="email"
                  name="correo_electronico"
                  value={form.correo_electronico}
                  onChange={handleChange}
                />
                <span className="ep-info" title="Campo obligatorio">ℹ</span>
              </div>
            </div>

            <div className="ep-field">
              <label>Ciudad</label>
              <input name="ciudad" value={form.ciudad} onChange={handleChange} />
            </div>

            <div className="ep-field">
              <label>País</label>
              <input name="pais" value={form.pais} onChange={handleChange} />
            </div>
          </div>

          <div className="ep-section">
            <h4 className="ep-section-label">Imagen del usuario</h4>
            <div className="ep-field">
              <label>Imagen actual</label>
              <button type="button" className="ep-img-btn">Imagen actual</button>
            </div>
            <div className="ep-field">
              <label>Imagen nueva</label>
              <button type="button" className="ep-img-btn">Nueva Imagen</button>
            </div>
          </div>

          {serverError && <p className="ep-error">{serverError}</p>}

          <div className="ep-actions">
            <button type="submit" className="btn-guardar" disabled={saving}>
              {saving ? 'Guardando...' : 'ACTUALIZAR INFORMACIÓN PERSONAL'}
            </button>
            <button type="button" className="btn-cancelar" onClick={() => navigate('/perfil')}>
              CANCELAR
            </button>
          </div>

          <p className="ep-required-note">
            <span className="ep-info">ℹ</span> En este formulario hay campos obligatorios
          </p>
        </form>
      </div>
    </div>
  );
};

export default EditarPerfil;
