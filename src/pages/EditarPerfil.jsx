import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PerfilHeader from '../components/PerfilHeader';
import './EditarPerfil.css';

const EditarPerfil = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
    // Endpoint no disponible aún en el backend
    alert('La edición de perfil estará disponible próximamente.');
  };

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

          <div className="ep-actions">
            <button type="submit" className="btn-guardar">
              ACTUALIZAR INFORMACIÓN PERSONAL
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
