import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, updatePreferenciasNotificaciones } from '../api/usuario.api';
import PerfilHeader from '../components/PerfilHeader';
import './PreferenciasNotificacion.css';

const PreferenciasNotificacion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [form, setForm] = useState({
    notificaciones: false,
    canal_tareas: 0,   // 0=ninguno 1=email 2=web 3=ambos
    canal_encuestas: 0,
  });

  useEffect(() => {
    getMe()
      .then(res => {
        const u = res.data;
        setForm({
          notificaciones: !u.notificaciones,
          canal_tareas: u.canal_tareas ?? 0,
          canal_encuestas: u.canal_encuestas ?? 0,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleCanal = (campo, bit) => {
    setForm(prev => ({
      ...prev,
      [campo]: prev[campo] ^ bit,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setServerError(null);
      await updatePreferenciasNotificaciones({
        notificaciones: form.notificaciones ? 0 : 1,
        canal_tareas: form.canal_tareas,
        canal_encuestas: form.canal_encuestas,
      });
      navigate('/perfil/preferencias');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const isActive = (campo, bit) => (form[campo] & bit) !== 0;

  if (loading) return <div className="page-loading">Cargando...</div>;

  return (
    <div className="pref-notif-page">
      <PerfilHeader />

      <div className="pref-notif-card">
        <h3 className="pref-notif-title">Preferencias del notificación</h3>

        <form onSubmit={handleSubmit}>
          {/* Desactivar notificaciones */}
          <div className="notif-field">
            <label>Desactivar las notificaciones</label>
            <input
              type="checkbox"
              checked={form.notificaciones}
              onChange={() => setForm(prev => ({ ...prev, notificaciones: !prev.notificaciones }))}
              className="notif-checkbox"
            />
          </div>

          {/* Tareas */}
          <div className="notif-field">
            <label>Notificaciones de tareas</label>
            <div className="canal-btns">
              <button
                type="button"
                className={`canal-btn ${isActive('canal_tareas', 1) ? 'active' : ''}`}
                onClick={() => toggleCanal('canal_tareas', 1)}
              >
                Email
              </button>
              <button
                type="button"
                className={`canal-btn ${isActive('canal_tareas', 2) ? 'active' : ''}`}
                onClick={() => toggleCanal('canal_tareas', 2)}
              >
                Web
              </button>
            </div>
          </div>

          {/* Encuestas */}
          <div className="notif-field">
            <label>Notificaciones de encuestas</label>
            <div className="canal-btns">
              <button
                type="button"
                className={`canal-btn ${isActive('canal_encuestas', 1) ? 'active' : ''}`}
                onClick={() => toggleCanal('canal_encuestas', 1)}
              >
                Email
              </button>
              <button
                type="button"
                className={`canal-btn ${isActive('canal_encuestas', 2) ? 'active' : ''}`}
                onClick={() => toggleCanal('canal_encuestas', 2)}
              >
                Web
              </button>
            </div>
          </div>

          {serverError && <p className="pref-error">{serverError}</p>}

          <div className="pref-actions">
            <button type="submit" className="btn-guardar" disabled={saving}>
              {saving ? 'Guardando...' : 'GUARDAR CAMBIOS'}
            </button>
            <button
              type="button"
              className="btn-cancelar"
              onClick={() => navigate('/perfil/preferencias')}
            >
              CANCELAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreferenciasNotificacion;
