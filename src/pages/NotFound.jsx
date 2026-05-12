import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();
  const { tr } = useLang();
  return (
    <div className="notfound-page">
      <div className="notfound-card">
        <h1 className="notfound-code">404</h1>
        <p className="notfound-title">{tr('nf_title')}</p>
        <p className="notfound-msg">{tr('nf_text')}</p>
        <button className="btn-notfound" onClick={() => navigate('/dashboard')}>
          {tr('nf_back')}
        </button>
      </div>
    </div>
  );
};

export default NotFound;
