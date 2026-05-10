import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCursos, getModulosByCurso, getRecursosByModulo } from '../api/cursos.api';
import './Calendario.css';

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const buildCalendar = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
};

const Calendario = () => {
  const today = new Date();
  const navigate = useNavigate();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [tareas, setTareas] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  const cells = buildCalendar(year, month);

  useEffect(() => {
    getCursos()
      .then(res => Promise.all(
        res.data.map(c =>
          getModulosByCurso(c.id)
            .then(r => r.data.map(m => ({ ...m, cursoNombre: c.nombre })))
            .catch(() => [])
        )
      ))
      .then(groups => Promise.all(
        groups.flat().map(m =>
          getRecursosByModulo(m.id)
            .then(r => r.data.map(rec => ({ ...rec, cursoNombre: m.cursoNombre })))
            .catch(() => [])
        )
      ))
      .then(recursoGroups => {
        setTareas(
          recursoGroups.flat().filter(r => r.es_entregable === 1 && r.fecha_entrega)
        );
      })
      .catch(console.error);
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
    const d = new Date(t.fecha_entrega);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!tareasPorDia[key]) tareasPorDia[key] = [];
    tareasPorDia[key].push(t);
  });

  const tareasDelDia = selectedDay
    ? (tareasPorDia[`${year}-${month}-${selectedDay}`] || [])
    : [];

  return (
    <div className="calendario-page">
      <div className="cal-main-card">

        <div className="cal-card-header">
          <h1 className="cal-title">Calendario</h1>
          <p className="cal-breadcrumb">
            <Link to="/dashboard">Inicio</Link>
            <span> / </span>
            <span>Calendario</span>
          </p>
        </div>

        <div className="cal-body">
          <div className="cal-content">

            <div className="cal-actions-bar">
              <div className="cal-left-btns">
                <button className="cal-action-btn">Modificar Vista</button>
                <button className="cal-action-btn">Mostrar por Cursos</button>
              </div>
              <button className="cal-action-btn cal-btn-nuevo">Nuevo Evento</button>
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
                const key = `${year}-${month}-${day}`;
                const hasTareas = day && !!tareasPorDia[key];
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
                    {hasTareas && <span className="cal-dot" />}
                  </div>
                );
              })}
            </div>

            {selectedDay && (
              <div className="cal-day-tareas">
                <div className="cal-day-tareas-title">
                  {selectedDay} de {MESES[month]}
                </div>
                {tareasDelDia.length === 0 ? (
                  <p className="cal-day-empty">Sin tareas para este día</p>
                ) : (
                  <ul className="cal-tarea-list">
                    {tareasDelDia.map(t => (
                      <li
                        key={t.id}
                        className="cal-tarea-item"
                        onClick={() => navigate(`/recurso/${t.id}`)}
                      >
                        <span className="cal-tarea-nombre">{t.titulo}</span>
                        <span className="cal-tarea-curso">{t.cursoNombre}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

          </div>

          <div className="cal-sidebar">
            <div className="cal-mini-widget">
              <div className="cal-mini-header">Vista del Mes</div>
              <div className="cal-mini-placeholder" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendario;
