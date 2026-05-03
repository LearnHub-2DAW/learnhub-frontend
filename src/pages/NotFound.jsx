import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="notfound-page">
      <div className="notfound-card">
        <h1 className="notfound-code">404</h1>
        <p className="notfound-title">Página no encontrada</p>
        <p className="notfound-msg">La dirección que buscas no existe o ha sido movida.</p>
        <button className="btn-notfound" onClick={() => navigate('/dashboard')}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default NotFound;
