import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMisEntregas } from '../api/usuario.api';
import { useLang } from '../context/LangContext';
import './MisEntregas.css';

const MisEntregas = () => {
  const { tr } = useLang();
  const navigate = useNavigate();
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMisEntregas()
      .then(res => setEntregas(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatFecha = (fecha) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  if (loading) return <div className="page-loading">{tr('me_loading')}</div>;

  return (
    <div className="mis-entregas-page">
      <div className="page-card">

        <div className="page-card-header">
          <h1 className="page-title">{tr('me_title')}</h1>
          <p className="page-breadcrumb">
            <Link to="/dashboard">{tr('home')}</Link>
            <span> / </span>
            <span>{tr('me_title')}</span>
          </p>
        </div>

        <div className="mis-entregas-body">
          {entregas.length === 0 ? (
            <p className="no-data-msg">{tr('me_noSubmissions')}</p>
          ) : (
            <table className="entregas-table">
              <thead>
                <tr>
                  <th>{tr('cp_resourceTitle')}</th>
                  <th>{tr('dt_submittedOn')}</th>
                  <th>{tr('me_grade')}</th>
                  <th>{tr('dt_submissionComment')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entregas.map((e, i) => (
                  <tr
                    key={i}
                    className="entrega-row"
                    onClick={() => navigate(`/recurso/${e.id_recurso}`)}
                  >
                    <td>{e.titulo || '—'}</td>
                    <td className="fecha-cell">{formatFecha(e.fecha_entregado)}</td>
                    <td className={e.calificacion != null ? 'calificacion-cell calificacion-nota' : 'calificacion-cell calificacion-pendiente'}>
                      {e.calificacion != null ? `${e.calificacion}/10` : '—'}
                    </td>
                    <td className="contenido-cell">
                      {e.contenido_enviado
                        ? e.contenido_enviado.length > 80
                          ? e.contenido_enviado.slice(0, 80) + '…'
                          : e.contenido_enviado
                        : '—'}
                    </td>
                    <td>
                      <Link
                        to={`/recurso/${e.id_recurso}`}
                        className="btn-ver-recurso"
                        onClick={ev => ev.stopPropagation()}
                      >
                        {tr('me_goToResource')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MisEntregas;
