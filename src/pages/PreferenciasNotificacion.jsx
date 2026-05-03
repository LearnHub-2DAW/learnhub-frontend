import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PerfilHeader from '../components/PerfilHeader';
import './PreferenciasNotificacion.css';

const PreferenciasNotificacion = () => {
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState(false);
  const [canalTareas, setCanalTareas] = useState({ email: false, web: false });
  const [canalEncuestas, setCanalEncuestas] = useState({ email: false, web: false });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Endpoint no disponible aún en el backend
    alert('Las preferencias de notificación estarán disponibles próximamente.');
  };

  return (
    <div className="pref-notif-page">
      <PerfilHeader />

      <div className="pref-notif-card">
        <h3 className="pref-notif-title">Preferencias del notificación</h3>

        <form onSubmit={handleSubmit}>
          <div className="notif-field">
            <label>Desactivar las notificaciones</label>
            <input
              type="checkbox"
              checked={notificaciones}
              onChange={() => setNotificaciones(v => !v)}
              className="notif-checkbox"
            />
          </div>

          <div className="notif-field">
            <label>Notificaciones de tareas</label>
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
            <label>Notificaciones de encuestas</label>
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

export default PreferenciasNotificacion;
