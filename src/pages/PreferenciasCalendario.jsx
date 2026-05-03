import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PerfilHeader from '../components/PerfilHeader';
import './PreferenciasCalendario.css';

const PreferenciasCalendario = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    formato_hora: '', primer_dia_semana: '', n_max_eventos: '',
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Endpoint no disponible aún en el backend
    alert('Las preferencias de calendario estarán disponibles próximamente.');
  };

  return (
    <div className="pref-cal-page">
      <PerfilHeader />

      <div className="pref-cal-card">
        <h3 className="pref-cal-title">Preferencias del calendario</h3>

        <form onSubmit={handleSubmit}>
          <div className="pref-field">
            <label>Formato de hora</label>
            <input
              name="formato_hora"
              value={form.formato_hora}
              onChange={handleChange}
              placeholder="12h / 24h"
            />
          </div>

          <div className="pref-field">
            <label>Primer día de la semana</label>
            <input
              name="primer_dia_semana"
              value={form.primer_dia_semana}
              onChange={handleChange}
              placeholder="Lunes / Domingo"
            />
          </div>

          <div className="pref-field">
            <label>Nº máximo de eventos próximos</label>
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
            <button type="submit" className="btn-guardar">GUARDAR CAMBIOS</button>
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

export default PreferenciasCalendario;
