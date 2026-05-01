import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CursoPagina from './pages/CursoPagina';
import Calificaciones from './pages/Calificaciones';
import CalificacionesCursos from './pages/CalificacionesCursos';
import Participantes from './pages/Participantes';
import DetalleTarea from './pages/DetalleTarea';
import AgregarEntrega from './pages/AgregarEntrega';
import Perfil from './pages/Perfil';
import Preferencias from './pages/Preferencias';
import EditarPerfil from './pages/EditarPerfil';
import CambiarContrasena from './pages/CambiarContrasena';
import PreferenciasCalendario from './pages/PreferenciasCalendario';
import PreferenciasNotificacion from './pages/PreferenciasNotificacion';
import Calendario from './pages/Calendario';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const P = ({ children }) => <PrivateRoute>{children}</PrivateRoute>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Auth (sin Layout) ── */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Páginas principales (con Header + Footer) ── */}
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<P><Dashboard /></P>} />

            {/* Calendario */}
            <Route path="/calendario" element={<P><Calendario /></P>} />

            {/* Calificaciones globales */}
            <Route path="/calificaciones" element={<P><CalificacionesCursos /></P>} />

            {/* Cursos */}
            <Route path="/curso/:id" element={<P><CursoPagina /></P>} />
            <Route path="/curso/:id/calificaciones" element={<P><Calificaciones /></P>} />
            <Route path="/curso/:id/participantes" element={<P><Participantes /></P>} />

            {/* Recursos / Tareas */}
            <Route path="/recurso/:id" element={<P><DetalleTarea /></P>} />
            <Route path="/recurso/:id/entrega" element={<P><AgregarEntrega /></P>} />

            {/* Perfil */}
            <Route path="/perfil" element={<P><Perfil /></P>} />
            <Route path="/perfil/editar" element={<P><EditarPerfil /></P>} />
            <Route path="/perfil/cambiar-contrasena" element={<P><CambiarContrasena /></P>} />
            <Route path="/perfil/preferencias" element={<P><Preferencias /></P>} />
            <Route path="/perfil/preferencias/calendario" element={<P><PreferenciasCalendario /></P>} />
            <Route path="/perfil/preferencias/notificaciones" element={<P><PreferenciasNotificacion /></P>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
