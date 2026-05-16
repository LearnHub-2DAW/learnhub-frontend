import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../context/LangContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updatePerfil } from '../../api/usuario.api';
import PerfilHeader from '../../components/PerfilHeader';
import './PreferenciasNotificacion.css';

const PreferenciasNotificacion = () => {
  const navigate = useNavigate();
  const { tr } = useLang();
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    notificaciones: user?.notificaciones ?? true,
    canal_tareas: user?.canal_tareas ?? true,
    canal_encuestas: user?.canal_encuestas ?? true,
  });
  const [saving, setSaving] = useState(false);

  const toggle = (key) => setForm(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updatePerfil(form);
      updateUser(res.data);
      toast('Preferencias de notificación guardadas');
      navigate('/perfil/preferencias');
    } catch (err) {
      toast(err.response?.data?.message || 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pref-notif-page">
      <PerfilHeader />

      <div className="pref-notif-card">
        <h3 className="pref-notif-title">{tr('pn_title')}</h3>

        <form onSubmit={handleSubmit}>
          <div className="notif-field">
            <label>{tr('pn_disableAll')}</label>
            <input
              type="checkbox"
              checked={!form.notificaciones}
              onChange={() => toggle('notificaciones')}
              className="notif-checkbox"
            />
          </div>

          <div className="notif-field">
            <label>{tr('pn_taskNotif')}</label>
            <button
              type="button"
              className={`canal-btn ${form.canal_tareas ? 'active' : ''}`}
              onClick={() => toggle('canal_tareas')}
            >
              {form.canal_tareas ? 'Activado' : 'Desactivado'}
            </button>
          </div>

          <div className="notif-field">
            <label>{tr('pn_surveyNotif')}</label>
            <button
              type="button"
              className={`canal-btn ${form.canal_encuestas ? 'active' : ''}`}
              onClick={() => toggle('canal_encuestas')}
            >
              {form.canal_encuestas ? 'Activado' : 'Desactivado'}
            </button>
          </div>

          <div className="pref-actions">
            <button type="submit" className="btn-guardar" disabled={saving}>
              {saving ? tr('saving') : tr('ae_saveChanges')}
            </button>
            <button
              type="button"
              className="btn-cancelar"
              onClick={() => navigate('/perfil/preferencias')}
            >
              {tr('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreferenciasNotificacion;
