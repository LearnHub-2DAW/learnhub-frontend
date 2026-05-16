import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../context/LangContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updatePerfil } from '../../api/usuario.api';
import PerfilHeader from '../../components/PerfilHeader';
import './PreferenciasCalendario.css';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const PreferenciasCalendario = () => {
  const navigate = useNavigate();
  const { tr } = useLang();
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    formato_hora: user?.formato_hora || '24h',
    primer_dia_semana: user?.primer_dia_semana || 'Lunes',
    n_max_eventos: user?.n_max_eventos || 5,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'n_max_eventos' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updatePerfil(form);
      updateUser(res.data);
      toast('Preferencias de calendario guardadas');
      navigate('/perfil/preferencias');
    } catch (err) {
      toast(err.response?.data?.message || 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pref-cal-page">
      <PerfilHeader />

      <div className="pref-cal-card">
        <h3 className="pref-cal-title">{tr('pcal_title')}</h3>

        <form onSubmit={handleSubmit}>
          <div className="pref-field">
            <label>{tr('pcal_timeFormat')}</label>
            <select name="formato_hora" value={form.formato_hora} onChange={handleChange}>
              <option value="24h">24h</option>
              <option value="12h">12h</option>
            </select>
          </div>

          <div className="pref-field">
            <label>{tr('pcal_firstDay')}</label>
            <select name="primer_dia_semana" value={form.primer_dia_semana} onChange={handleChange}>
              {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="pref-field">
            <label>{tr('pcal_maxEvents')}</label>
            <input
              type="number"
              name="n_max_eventos"
              value={form.n_max_eventos}
              onChange={handleChange}
              min="1"
              max="99"
            />
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

export default PreferenciasCalendario;
