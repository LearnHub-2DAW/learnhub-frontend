import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import './AdminPanel.css';

const SECCIONES_ADMIN = ['usuarios', 'cursos'];
const SECCIONES_PROFESOR = ['cursos'];

const AdminPanel = () => {
  const { user } = useAuth();
  const { tr } = useLang();

  const isAdmin = user?.roles?.includes('admin');
  const isProfesor = user?.roles?.includes('profesor');

  if (!isAdmin && !isProfesor) return <Navigate to="/dashboard" replace />;

  const secciones = isAdmin ? SECCIONES_ADMIN : SECCIONES_PROFESOR;
  const [activa, setActiva] = useState(secciones[0]);

  return (
    <div className="ap-layout">

      <aside className="ap-sidebar">
        <div className="ap-sidebar-title">{isAdmin ? tr('nav_adminPanel') : 'Panel Profesor'}</div>
        <nav className="ap-nav">
          {isAdmin && (
            <button
              className={`ap-nav-item ${activa === 'usuarios' ? 'ap-nav-active' : ''}`}
              onClick={() => setActiva('usuarios')}
            >
              <span className="ap-nav-icon">👤</span> Usuarios
            </button>
          )}
          <button
            className={`ap-nav-item ${activa === 'cursos' ? 'ap-nav-active' : ''}`}
            onClick={() => setActiva('cursos')}
          >
            <span className="ap-nav-icon">📚</span> Cursos
          </button>
        </nav>
      </aside>

      <main className="ap-content">
        {activa === 'usuarios' && isAdmin && (
          <div className="ap-section-placeholder">
            <h2>Usuarios</h2>
            <p>Gestión de usuarios próximamente.</p>
          </div>
        )}
        {activa === 'cursos' && (
          <div className="ap-section-placeholder">
            <h2>Cursos</h2>
            <p>Gestión de cursos próximamente.</p>
          </div>
        )}
      </main>

    </div>
  );
};

export default AdminPanel;
