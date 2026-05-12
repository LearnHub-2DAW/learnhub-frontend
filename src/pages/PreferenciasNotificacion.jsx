import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import PerfilHeader from '../components/PerfilHeader';
import './PreferenciasNotificacion.css';

const PreferenciasNotificacion = () => {
  const navigate = useNavigate();
  const { tr } = useLang();
  const [notificaciones, setNotificaciones] = useState(false);
  const [canalTareas, setCanalTareas] = useState({ email: false, web: false });
  const [canalEncuestas, setCanalEncuestas] = useState({ email: false, web: false });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Las preferencias de notificación estarán disponibles próximamente.');
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
              checked={notificaciones}
              onChange={() => setNotificaciones(v => !v)}
              className="notif-checkbox"
            />
          </div>

          <div className="notif-field">
            <label>{tr('pn_taskNotif')}</label>
            <div className="canal-btns">
              <button
                type="button"
                className={`canal-btn ${canalTareas.email ? 'active' : ''}`}
                onClick={() => setCanalTareas(v => ({ ...v, email: !v.email }))}
              >
                Email
              </button>
              <button
                type="button"
                className={`canal-btn ${canalTareas.web ? 'active' : ''}`}
                onClick={() => setCanalTareas(v => ({ ...v, web: !v.web }))}
              >
                Web
              </button>
            </div>
          </div>

          <div className="notif-field">
            <label>{tr('pn_surveyNotif')}</label>
            <div className="canal-btns">
              <button
                type="button"
                className={`canal-btn ${canalEncuestas.email ? 'active' : ''}`}
                onClick={() => setCanalEncuestas(v => ({ ...v, email: !v.email }))}
              >
                Email
              </button>
              <button
                type="button"
                className={`canal-btn ${canalEncuestas.web ? 'active' : ''}`}
                onClick={() => setCanalEncuestas(v => ({ ...v, web: !v.web }))}
              >
                Web
              </button>
            </div>
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

export default PreferenciasNotificacion;
