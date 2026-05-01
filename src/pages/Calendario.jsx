import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Calendario.css';

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const buildCalendar = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
};

const Calendario = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const cells = buildCalendar(year, month);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  return (
    <div className="calendario-page">
      <div className="cal-main-card">

        {/* Título */}
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
            {/* Barra de acciones */}
            <div className="cal-actions-bar">
              <div className="cal-left-btns">
                <button className="cal-action-btn">Modificar Vista</button>
                <button className="cal-action-btn">Mostrar por Cursos</button>
              </div>
              <button className="cal-action-btn cal-btn-nuevo">Nuevo Evento</button>
            </div>

            {/* Navegación del mes */}
            <div className="cal-nav">
              <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
              <span className="cal-month-title">{MESES[month]} {year}</span>
              <button className="cal-nav-btn" onClick={nextMonth}>›</button>
            </div>

            {/* Grid del calendario */}
            <div className="cal-grid">
              {DIAS_SEMANA.map(d => (
                <div key={d} className="cal-day-header">{d}</div>
              ))}
              {cells.map((day, i) => (
                <div
                  key={i}
                  className={`cal-cell ${!day ? 'cal-empty' : ''} ${
                    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                      ? 'cal-today' : ''
                  }`}
                >
                  {day || ''}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar: vista del mes */}
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
