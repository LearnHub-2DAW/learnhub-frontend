import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getCursos, getModulosByCurso, getRecursosByModulo,
  getEventosByModulo, createEvento, updateEvento, deleteEvento,
} from '../api/cursos.api';
import { getMisModulos } from '../api/usuario.api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLang } from '../context/LangContext';
import './Calendario.css';

const buildCalendar = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
};

const dayKey = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

const Calendario = () => {
  const today = new Date();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { tr } = useLang();
  const isStaff = user?.roles?.includes('admin') || user?.roles?.includes('profesor');

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [tareas, setTareas] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  const [eventoModal, setEventoModal] = useState(false);
  const [eventoForm, setEventoForm] = useState({ id_modulo: '', titulo: '', fecha: '', hora: '' });
  const [savingEvento, setSavingEvento] = useState(false);
  const [eventoError, setEventoError] = useState('');

  const [editEventoModal, setEditEventoModal] = useState(false);
  const [editEventoForm, setEditEventoForm] = useState({ id: null, titulo: '', fecha: '', hora: '' });
  const [savingEditEvento, setSavingEditEvento] = useState(false);
  const [editEventoError, setEditEventoError] = useState('');

  const MESES = tr('cal_months');
  const DIAS_SEMANA = tr('cal_days');
  const cells = buildCalendar(year, month);

  useEffect(() => {
    const load = async () => {
      let mods = [];

      const isAdmin = user?.roles?.includes('admin');
      const isProfesor = user?.roles?.includes('profesor');

      if (isAdmin || isProfesor) {
        const cursosRes = await getCursos();
        const groups = await Promise.all(
          cursosRes.data.map(c =>
            getModulosByCurso(c.id)
              .then(r => r.data.map(m => ({ ...m, cursoNombre: c.nombre })))
              .catch(() => [])
          )
        );
        const allMods = groups.flat();
        mods = isProfesor
          ? allMods.filter(m => m.id_profesor === user.id)
          : allMods;
      } else {
        const res = await getMisModulos();
        mods = res.data;
      }

      setModulos(mods);

      const [recursosGroups, eventosGroups] = await Promise.all([
        Promise.all(
          mods.map(m =>
            getRecursosByModulo(m.id)
              .then(r => r.data.map(rec => ({ ...rec, cursoNombre: m.cursoNombre || m.nombre })))
              .catch(() => [])
          )
        ),
        Promise.all(
          mods.map(m =>
            getEventosByModulo(m.id)
              .then(r => r.data.map(e => ({ ...e, moduloNombre: m.nombre })))
              .catch(() => [])
          )
        ),
      ]);

      setTareas(recursosGroups.flat().filter(r => r.es_entregable === 1 && r.fecha_entrega));
      setEventos(eventosGroups.flat());
    };

    load().catch(console.error);
  }, []);

  const prevMonth = () => {
    setSelectedDay(null);
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    setSelectedDay(null);
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const tareasPorDia = {};
  tareas.forEach(t => {
    const k = dayKey(t.fecha_entrega);
    if (!tareasPorDia[k]) tareasPorDia[k] = [];
    tareasPorDia[k].push(t);
  });

  const eventosPorDia = {};
  eventos.forEach(e => {
    const k = dayKey(e.fecha);
    if (!eventosPorDia[k]) eventosPorDia[k] = [];
    eventosPorDia[k].push(e);
  });

  const selectedKey = selectedDay ? `${year}-${month}-${selectedDay}` : null;
  const itemsDelDia = selectedKey
    ? [
        ...(tareasPorDia[selectedKey] || []).map(t => ({ ...t, tipo: 'tarea' })),
        ...(eventosPorDia[selectedKey] || []).map(e => ({ ...e, tipo: 'evento' })),
      ]
    : [];

  const maxUpcoming = user?.n_max_eventos || 6;
  const upcoming = [
    ...tareas.map(t => ({ ...t, tipo: 'tarea', _d: new Date(t.fecha_entrega) })),
    ...eventos.map(e => ({ ...e, tipo: 'evento', _d: new Date(e.fecha) })),
  ]
    .filter(x => x._d >= today)
    .sort((a, b) => a._d - b._d)
    .slice(0, maxUpcoming);

  const openEventoModal = () => {
    const pad = n => String(n).padStart(2, '0');
    const fechaDefault = selectedDay
      ? `${year}-${pad(month + 1)}-${pad(selectedDay)}`
      : '';
    setEventoForm({
      id_modulo: modulos[0]?.id ? String(modulos[0].id) : '',
      titulo: '',
      fecha: fechaDefault,
      hora: '',
    });
    setEventoError('');
    setEventoModal(true);
  };

  const submitEvento = async () => {
    if (!eventoForm.id_modulo || !eventoForm.titulo.trim() || !eventoForm.fecha) {
      setEventoError(tr('cal_error_required'));
      return;
    }
    setSavingEvento(true);
    setEventoError('');
    try {
      const payload = {
        id_modulo: Number(eventoForm.id_modulo),
        titulo: eventoForm.titulo,
        fecha: eventoForm.fecha,
      };
      if (eventoForm.hora) payload.hora = eventoForm.hora;

      const res = await createEvento(payload);
      const nuevoEvento = res.data;
      const modulo = modulos.find(m => m.id === Number(eventoForm.id_modulo));
      setEventos(prev => [...prev, { ...nuevoEvento, moduloNombre: modulo?.nombre || '' }]);
      setEventoModal(false);
      toast(tr('cal_evento_created'));
    } catch (err) {
      setEventoError(err.response?.data?.message || tr('cal_error_create'));
    } finally {
      setSavingEvento(false);
    }
  };

  const openEditEvento = (e, evento) => {
    e.stopPropagation();
    setEditEventoForm({
      id: evento.id,
      titulo: evento.titulo,
      fecha: evento.fecha ? evento.fecha.split('T')[0] : '',
      hora: evento.hora ? evento.hora.slice(0, 5) : '',
    });
    setEditEventoError('');
    setEditEventoModal(true);
  };

  const submitEditEvento = async () => {
    if (!editEventoForm.titulo.trim() || !editEventoForm.fecha) {
      setEditEventoError(tr('cal_error_title_date'));
      return;
    }
    setSavingEditEvento(true);
    setEditEventoError('');
    try {
      const payload = { titulo: editEventoForm.titulo, fecha: editEventoForm.fecha };
      if (editEventoForm.hora) payload.hora = editEventoForm.hora;
      const res = await updateEvento(editEventoForm.id, payload);
      setEventos(prev => prev.map(ev => ev.id === editEventoForm.id ? { ...ev, ...res.data } : ev));
      setEditEventoModal(false);
      toast(tr('cal_evento_updated'));
    } catch (err) {
      setEditEventoError(err.response?.data?.message || tr('cal_error_update'));
    } finally {
      setSavingEditEvento(false);
    }
  };

  const handleDeleteEvento = async (e, eventoId) => {
    e.stopPropagation();
    if (!window.confirm(tr('cal_confirm_delete'))) return;
    try {
      await deleteEvento(eventoId);
      setEventos(prev => prev.filter(ev => ev.id !== eventoId));
      toast(tr('cal_evento_deleted'));
    } catch (err) {
      toast(err.response?.data?.message || tr('cal_error_update'), 'error');
    }
  };

  return (
    <div className="calendario-page">
      <div className="cal-main-card">

        <div className="cal-card-header">
          <h1 className="cal-title">{tr('cal_title')}</h1>
          <p className="cal-breadcrumb">
            <Link to="/dashboard">{tr('home')}</Link>
            <span> / </span>
            <span>{tr('cal_title')}</span>
          </p>
        </div>

        <div className="cal-body">
          <div className="cal-content">

            <div className="cal-actions-bar">
              <div className="cal-legend">
                <span className="cal-legend-item">
                  <span className="cal-dot cal-dot-tarea" />{tr('cal_legend_tasks')}
                </span>
                <span className="cal-legend-item">
                  <span className="cal-dot cal-dot-evento" />{tr('cal_legend_events')}
                </span>
              </div>
              {isStaff && (
                <button className="cal-action-btn cal-btn-nuevo" onClick={openEventoModal}>
                  {tr('cal_newEvent')}
                </button>
              )}
            </div>

            <div className="cal-nav">
              <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
              <span className="cal-month-title">{MESES[month]} {year}</span>
              <button className="cal-nav-btn" onClick={nextMonth}>›</button>
            </div>

            <div className="cal-grid">
              {DIAS_SEMANA.map(d => (
                <div key={d} className="cal-day-header">{d}</div>
              ))}
              {cells.map((day, i) => {
                const k = `${year}-${month}-${day}`;
                const hasTareas = day && !!tareasPorDia[k];
                const hasEventos = day && !!eventosPorDia[k];
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const isSelected = day === selectedDay;
                return (
                  <div
                    key={i}
                    className={[
                      'cal-cell',
                      !day ? 'cal-empty' : '',
                      isToday ? 'cal-today' : '',
                      isSelected && !isToday ? 'cal-selected' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => day && setSelectedDay(day === selectedDay ? null : day)}
                  >
                    {day || ''}
                    <span className="cal-dots">
                      {hasTareas && <span className="cal-dot cal-dot-tarea" />}
                      {hasEventos && <span className="cal-dot cal-dot-evento" />}
                    </span>
                  </div>
                );
              })}
            </div>

            {selectedDay && (
              <div className="cal-day-tareas">
                <div className="cal-day-tareas-title">
                  {selectedDay} {MESES[month]}
                </div>
                {itemsDelDia.length === 0 ? (
                  <p className="cal-day-empty">{tr('cal_noTasksDay')}</p>
                ) : (
                  <ul className="cal-tarea-list">
                    {itemsDelDia.map((item, idx) => (
                      <li
                        key={idx}
                        className={`cal-tarea-item ${item.tipo === 'evento' ? 'cal-item-evento' : ''}`}
                        onClick={() => item.tipo === 'tarea' && navigate(`/recurso/${item.id}`)}
                        style={{ cursor: item.tipo === 'tarea' ? 'pointer' : 'default' }}
                      >
                        <span className="cal-tarea-nombre">
                          {item.tipo === 'evento' ? '📅' : '📝'} {item.titulo}
                        </span>
                        <span className="cal-tarea-curso">
                          {item.tipo === 'evento'
                            ? `${item.moduloNombre}${item.hora ? ' · ' + item.hora.slice(0, 5) : ''}`
                            : item.cursoNombre
                          }
                        </span>
                        {isStaff && item.tipo === 'evento' && (
                          <span className="cal-evento-actions">
                            <button className="cal-evento-btn-edit" onClick={e => openEditEvento(e, item)} title={tr('edit')}>✏️</button>
                            <button className="cal-evento-btn-del" onClick={e => handleDeleteEvento(e, item.id)} title={tr('delete')}>🗑️</button>
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

          </div>

          <div className="cal-sidebar">
            <div className="cal-mini-widget">
              <div className="cal-mini-header">{tr('cal_upcoming')}</div>
              {upcoming.length === 0 ? (
                <p className="cal-upcoming-empty">{tr('cal_no_upcoming')}</p>
              ) : (
                <ul className="cal-upcoming-list">
                  {upcoming.map((item, i) => (
                    <li
                      key={i}
                      className={`cal-upcoming-item ${item.tipo === 'tarea' ? 'cal-upcoming-tarea' : 'cal-upcoming-evento'}`}
                      onClick={() => item.tipo === 'tarea' && navigate(`/recurso/${item.id}`)}
                      style={{ cursor: item.tipo === 'tarea' ? 'pointer' : 'default' }}
                    >
                      <div className="cal-upcoming-date">
                        {item._d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </div>
                      <div className="cal-upcoming-title">{item.titulo}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {eventoModal && (
        <div className="cal-modal-overlay" onClick={() => setEventoModal(false)}>
          <div className="cal-modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="cal-modal-title">{tr('cal_newEvent')}</h3>

            <div className="cal-modal-field">
              <label>{tr('cal_module_label')}</label>
              <select
                value={eventoForm.id_modulo}
                onChange={e => setEventoForm(f => ({ ...f, id_modulo: e.target.value }))}
              >
                {modulos.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.cursoNombre ? `${m.cursoNombre} / ${m.nombre}` : m.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="cal-modal-field">
              <label>{tr('cal_title_label')}</label>
              <input
                type="text"
                value={eventoForm.titulo}
                onChange={e => setEventoForm(f => ({ ...f, titulo: e.target.value }))}
                autoFocus
              />
            </div>

            <div className="cal-modal-field">
              <label>{tr('cal_date_label')}</label>
              <input
                type="date"
                value={eventoForm.fecha}
                onChange={e => setEventoForm(f => ({ ...f, fecha: e.target.value }))}
              />
            </div>

            <div className="cal-modal-field">
              <label>{tr('cal_time_label')}</label>
              <input
                type="time"
                value={eventoForm.hora}
                onChange={e => setEventoForm(f => ({ ...f, hora: e.target.value }))}
              />
            </div>

            {eventoError && <p className="cal-modal-error">{eventoError}</p>}
            <div className="cal-modal-actions">
              <button className="cal-modal-cancel" onClick={() => setEventoModal(false)}>
                {tr('cancel')}
              </button>
              <button className="cal-modal-ok" onClick={submitEvento} disabled={savingEvento}>
                {savingEvento ? tr('saving') : tr('cal_create_event')}
              </button>
            </div>
          </div>
        </div>
      )}
      {editEventoModal && (
        <div className="cal-modal-overlay" onClick={() => setEditEventoModal(false)}>
          <div className="cal-modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="cal-modal-title">{tr('cal_edit_event')}</h3>

            <div className="cal-modal-field">
              <label>{tr('cal_title_label')}</label>
              <input
                type="text"
                value={editEventoForm.titulo}
                onChange={e => setEditEventoForm(f => ({ ...f, titulo: e.target.value }))}
                autoFocus
              />
            </div>

            <div className="cal-modal-field">
              <label>{tr('cal_date_label')}</label>
              <input
                type="date"
                value={editEventoForm.fecha}
                onChange={e => setEditEventoForm(f => ({ ...f, fecha: e.target.value }))}
              />
            </div>

            <div className="cal-modal-field">
              <label>{tr('cal_time_label')}</label>
              <input
                type="time"
                value={editEventoForm.hora}
                onChange={e => setEditEventoForm(f => ({ ...f, hora: e.target.value }))}
              />
            </div>

            {editEventoError && <p className="cal-modal-error">{editEventoError}</p>}
            <div className="cal-modal-actions">
              <button className="cal-modal-cancel" onClick={() => setEditEventoModal(false)}>{tr('cancel')}</button>
              <button className="cal-modal-ok" onClick={submitEditEvento} disabled={savingEditEvento}>
                {savingEditEvento ? tr('saving') : tr('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendario;
