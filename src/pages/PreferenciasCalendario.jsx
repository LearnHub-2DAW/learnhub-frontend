import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import PerfilHeader from '../components/PerfilHeader';
import './PreferenciasCalendario.css';

const PreferenciasCalendario = () => {
  const navigate = useNavigate();
  const { tr } = useLang();
  const [form, setForm] = useState({
    formato_hora: '', primer_dia_semana: '', n_max_eventos: '',
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Las preferencias de calendario estarán disponibles próximamente.');
  };

  return (
    <div className="pref-cal-page">
      <PerfilHeader />

      <div className="pref-cal-card">
        <h3 className="pref-cal-title">{tr('pcal_title')}</h3>

        <form onSubmit={handleSubmit}>
          <div className="pref-field">
            <label>{tr('pcal_timeFormat')}</label>
            <input
              name="formato_hora"
              value={form.formato_hora}
              onChange={handleChange}
              placeholder="12h / 24h"
            />
          </div>

          <div className="pref-field">
            <label>{tr('pcal_firstDay')}</label>
            <input
              name="primer_dia_semana"
              value={form.primer_dia_semana}
              onChange={handleChange}
            />
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
            <button type="submit" className="btn-guardar">{tr('ae_saveChanges')}</button>
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
