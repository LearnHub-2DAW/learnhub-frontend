import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRecursoById, getModuloById, getCursoById } from '../api/cursos.api';
import './DetalleTarea.css';

const DetalleTarea = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recurso, setRecurso] = useState(null);
  const [modulo, setModulo] = useState(null);
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecursoById(id)
      .then(async (res) => {
        const r = res.data;
        setRecurso(r);
        const modRes = await getModuloById(r.id_modulo);
        const m = modRes.data;
        setModulo(m);
        const curRes = await getCursoById(m.id_curso);
        setCurso(curRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const formatFecha = (fecha) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  };

  const tiempoRestante = () => {
    if (!recurso?.fecha_entrega) return '—';
    const diff = new Date(recurso.fecha_entrega) - new Date();
    if (diff < 0) return 'Plazo vencido';
    const dias = Math.floor(diff / 86400000);
    const horas = Math.floor((diff % 86400000) / 3600000);
    return `${dias} días ${horas} horas`;
  };

  if (loading) return <div className="page-loading">Cargando tarea...</div>;

  return (
    <div className="detalle-tarea-page">
      <div className="page-card">

        {/* Cabecera curso */}
        <div className="page-card-header">
          <h1 className="page-title">{curso?.nombre || 'Título Del Curso'}</h1>
          <p className="page-breadcrumb">
            <Link to="/dashboard">Inicio</Link>
            <span> / </span>
            {curso && <Link to={`/curso/${curso.id}`}>{curso.nombre}</Link>}
            {modulo && <><span> / </span><span>{modulo.nombre}</span></>}
            {recurso && <><span> / </span><span>{recurso.titulo}</span></>}
          </p>
        </div>

        <div className="tarea-body">
          {/* Nombre y descripción */}
          <h2 className="tarea-titulo">{recurso?.titulo || 'Nombre de la Tarea'}</h2>
          <div className="tarea-descripcion">
            {recurso?.contenido || 'Ficheros o descripción de la Tarea'}
          </div>

          {/* Estado de la entrega */}
          {recurso?.es_entregable && (
            <>
              <h3 className="estado-titulo">Estado de la entrega</h3>
              <table className="estado-table">
                <tbody>
                  <tr>
                    <td className="estado-label">Estado de la entrega</td>
                    <td className="estado-value">Sin entrega</td>
                  </tr>
                  <tr>
                    <td className="estado-label">Estado de la calificación</td>
                    <td className="estado-value">Sin calificar</td>
                  </tr>
                  <tr>
                    <td className="estado-label">Fecha de entrega</td>
                    <td className="estado-value">{formatFecha(recurso?.fecha_entrega)}</td>
                  </tr>
                  <tr>
                    <td className="estado-label">Tiempo restante</td>
                    <td className="estado-value">{tiempoRestante()}</td>
                  </tr>
                  <tr>
                    <td className="estado-label">Última modificación</td>
                    <td className="estado-value">—</td>
                  </tr>
                  <tr>
                    <td className="estado-label">Comentario de la entrega</td>
                    <td className="estado-value">—</td>
                  </tr>
                </tbody>
              </table>

              <div className="tarea-actions">
                <button
                  className="btn-agregar-entrega"
                  onClick={() => navigate(`/recurso/${id}/entrega`)}
                >
                  AGREGAR ENTREGA
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetalleTarea;
