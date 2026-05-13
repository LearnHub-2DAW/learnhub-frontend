import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { LangProvider } from './context/LangContext';
import { SocketProvider } from './context/SocketContext';
import { ChatDrawerProvider } from './context/ChatDrawerContext';
import Layout from './components/Layout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import CursoPagina from './pages/curso/CursoPagina';
import Calificaciones from './pages/curso/Calificaciones';
import CalificacionesCursos from './pages/curso/CalificacionesCursos';
import Participantes from './pages/curso/Participantes';
import DetalleTarea from './pages/curso/DetalleTarea';
import AgregarEntrega from './pages/curso/AgregarEntrega';
import Perfil from './pages/perfil/Perfil';
import Preferencias from './pages/perfil/Preferencias';
import EditarPerfil from './pages/perfil/EditarPerfil';
import CambiarContrasena from './pages/perfil/CambiarContrasena';
import PreferenciasCalendario from './pages/perfil/PreferenciasCalendario';
import PreferenciasNotificacion from './pages/perfil/PreferenciasNotificacion';
import Calendario from './pages/Calendario';
import MisEntregas from './pages/MisEntregas';
import Chat from './pages/Chat';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import NotFound from './pages/NotFound';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const P = ({ children }) => <PrivateRoute>{children}</PrivateRoute>;

function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <AuthProvider>
          <SocketProvider>
          <ChatDrawerProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<P><Dashboard /></P>} />
                  <Route path="/calendario" element={<P><Calendario /></P>} />
                  <Route path="/calificaciones" element={<P><CalificacionesCursos /></P>} />
                  <Route path="/curso/:id" element={<P><CursoPagina /></P>} />
                  <Route path="/curso/:id/calificaciones" element={<P><Calificaciones /></P>} />
                  <Route path="/curso/:id/participantes" element={<P><Participantes /></P>} />
                  <Route path="/recurso/:id" element={<P><DetalleTarea /></P>} />
                  <Route path="/recurso/:id/entrega" element={<P><AgregarEntrega /></P>} />
                  <Route path="/perfil" element={<P><Perfil /></P>} />
                  <Route path="/perfil/editar" element={<P><EditarPerfil /></P>} />
                  <Route path="/perfil/cambiar-contrasena" element={<P><CambiarContrasena /></P>} />
                  <Route path="/perfil/preferencias" element={<P><Preferencias /></P>} />
                  <Route path="/perfil/preferencias/calendario" element={<P><PreferenciasCalendario /></P>} />
                  <Route path="/perfil/preferencias/notificaciones" element={<P><PreferenciasNotificacion /></P>} />
                  <Route path="/mis-entregas" element={<P><MisEntregas /></P>} />
                  <Route path="/chat/:id" element={<P><Chat /></P>} />
                  <Route path="/admin/usuarios" element={<P><AdminUsuarios /></P>} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
          </ChatDrawerProvider>
          </SocketProvider>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
}

export default App;
