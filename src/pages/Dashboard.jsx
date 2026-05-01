import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCursos } from '../api/cursos.api';
import './Dashboard.css';

const VISIBLE_CAROUSEL = 3;

const CursoCard = ({ curso, onClick }) => (
  <div className="course-card" onClick={onClick}>
    <div className="course-thumb" />
    <span className="course-card-type">Curso</span>
    <p className="course-card-name">{curso.nombre}</p>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [codigoCurso, setCodigoCurso] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCursos()
      .then(res => setCursos(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const canPrev = carouselIndex > 0;
  const canNext = carouselIndex + VISIBLE_CAROUSEL < cursos.length;
  const visibleCursos = cursos.slice(carouselIndex, carouselIndex + VISIBLE_CAROUSEL);

  return (
    <div className="dashboard-page">
      <div className="dashboard-grid">

        {/* ── COLUMNA PRINCIPAL ── */}
        <div className="dashboard-main">

          {/* Fila: registrarse en un curso */}
          <div className="register-course-row">
            <span className="reg-label">Registrarse en un curso</span>
            <input
              type="text"
              placeholder="Código del Curso"
              value={codigoCurso}
              onChange={e => setCodigoCurso(e.target.value)}
              className="course-code-input"
            />
            <button className="btn-personalize">PERSONALIZAR ESTA PÁGINA</button>
          </div>

          {/* Widget: Cursos Accedidos Recientemente */}
          <div className="widget-box">
            <div className="widget-header">Cursos Accedidos Recientemente</div>
            <div className="carousel-container">
              <button
                className="carousel-btn"
                onClick={() => setCarouselIndex(i => i - 1)}
                disabled={!canPrev}
              >
                ‹
              </button>
              <div className="carousel-track">
                {loading ? (
                  <p className="empty-msg">Cargando cursos...</p>
                ) : cursos.length === 0 ? (
                  <p className="empty-msg">No hay cursos disponibles</p>
                ) : (
                  visibleCursos.map(c => (
                    <CursoCard key={c.id} curso={c} onClick={() => navigate(`/curso/${c.id}`)} />
                  ))
                )}
              </div>
              <button
                className="carousel-btn"
                onClick={() => setCarouselIndex(i => i + 1)}
                disabled={!canNext}
              >
                ›
              </button>
            </div>
          </div>

          {/* Widget: Vista General De Cursos */}
          <div className="widget-box">
            <div className="widget-header">Vista General De Cursos</div>
            <div className="courses-grid">
              {loading ? (
                <p className="empty-msg">Cargando...</p>
              ) : cursos.length === 0 ? (
                <p className="empty-msg">No hay cursos</p>
              ) : (
                cursos.map(c => (
                  <CursoCard key={c.id} curso={c} onClick={() => navigate(`/curso/${c.id}`)} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── COLUMNA DERECHA (sidebar) ── */}
        <div className="dashboard-sidebar">

          {/* Widget: Línea de Tiempo */}
          <div className="widget-box">
            <div className="widget-header sidebar-header-row">
              <span>Línea de Tiempo</span>
              <div className="sidebar-header-btns">
                <button className="icon-pill">🕐 ▼</button>
                <button className="icon-pill">≡ ▼</button>
              </div>
            </div>
            <ul className="timeline-list">
              <li>Fecha</li>
              <li>Titulo de la Tarea</li>
              <li>Curso Perteneciente</li>
              <li>Agregar Entrega</li>
            </ul>
            <div className="timeline-footer">
              Mostrar&nbsp;
              <select className="timeline-select">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
              </select>
            </div>
          </div>

          {/* Widget: Calendario */}
          <div className="widget-box">
            <div className="widget-header">Calendario</div>
            <div className="calendar-placeholder" />
          </div>

          {/* Widget: Usuarios en Línea */}
          <div className="widget-box">
            <div className="widget-header">Usuarios en Línea</div>
            <div className="online-users-body">
              <p className="online-count">N usuarios online</p>
              <div className="online-user-row">
                <span className="user-dot" />
                <span>Usuario</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
