import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, updatePreferenciasCalendario } from '../api/usuario.api';
import PerfilHeader from '../components/PerfilHeader';
import './PreferenciasCalendario.css';

const PreferenciasCalendario = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [form, setForm] = useState({
    formato_hora: '', primer_dia_semana: '', n_max_eventos: '',
  });

  useEffect(() => {
    getMe()
      .then(res => {
        const u = res.data;
        setForm({
          formato_hora: u.formato_hora ?? '',
          primer_dia_semana: u.primer_dia_semana ?? '',
          n_max_eventos: u.n_max_eventos ?? '',
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
    try {
      setSaving(true);
      setServerError(null);
      await updatePreferenciasCalendario(form);
      navigate('/perfil/preferencias');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loading">Cargando...</div>;

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

export default PreferenciasCalendario;
