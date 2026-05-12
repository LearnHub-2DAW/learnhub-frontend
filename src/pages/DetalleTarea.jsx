import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLang } from '../context/LangContext';
import { getRecursoById, getModuloById, getCursoById, updateRecurso, deleteRecurso, getMyEntrega, getEntregas } from '../api/cursos.api';
import { getFileUrl } from '../api/axios';
import './DetalleTarea.css';

const EMPTY_FORM = { titulo: '', contenido: '', es_entregable: false, fecha_entrega: '', archivo: null };

const DetalleTarea = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isStaff = user?.roles?.includes('admin') || user?.roles?.includes('profesor');
  const isAdmin = user?.roles?.includes('admin');
  const toast = useToast();
  const { tr } = useLang();

  const [recurso, setRecurso] = useState(null);
  const [modulo, setModulo] = useState(null);
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);

  const [miEntrega, setMiEntrega] = useState(null);
  const [todasEntregas, setTodasEntregas] = useState([]);
  const [mostrarEntregas, setMostrarEntregas] = useState(false);
  const [loadingEntregas, setLoadingEntregas] = useState(false);

  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

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

        if (r.es_entregable === 1 && !isStaff) {
          getMyEntrega(r.id).then(e => setMiEntrega(e.data)).catch(() => setMiEntrega(null));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const cargarTodasEntregas = async () => {
    setLoadingEntregas(true);
    try {
      const res = await getEntregas(id);
      setTodasEntregas(res.data);
      setMostrarEntregas(true);
    } catch (err) {
      toast(err.response?.data?.message || 'Error al cargar entregas', 'error');
    } finally {
      setLoadingEntregas(false);
    }
  };

  const openEditar = () => {
    setEditForm({
      titulo: recurso.titulo,
      contenido: recurso.contenido || '',
      es_entregable: recurso.es_entregable === 1,
      fecha_entrega: recurso.fecha_entrega ? recurso.fecha_entrega.split('T')[0] : '',
      archivo: null,
    });
    setModalError('');
    setEditModal(true);
  };

  const submitEditar = async () => {
    if (!editForm.titulo.trim()) return setModalError('El título es obligatorio');
    setSaving(true);
    setModalError('');
    try {
      const fd = new FormData();
      fd.append('titulo', editForm.titulo);
      fd.append('contenido', editForm.contenido);
      fd.append('es_entregable', editForm.es_entregable ? 'true' : 'false');
      if (editForm.es_entregable && editForm.fecha_entrega) {
        fd.append('fecha_entrega', editForm.fecha_entrega);
      }
      if (editForm.archivo) fd.append('archivo', editForm.archivo);
      const res = await updateRecurso(id, fd);
      setRecurso(res.data);
      setEditModal(false);
      toast('Recurso actualizado correctamente');
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async () => {
    if (!window.confirm(`¿Eliminar el recurso "${recurso.titulo}"?`)) return;
    try {
      await deleteRecurso(id);
      navigate(curso ? `/curso/${curso.id}` : '/dashboard');
    } catch (err) {
      toast(err.response?.data?.message || 'Error al eliminar', 'error');
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  };

  const tiempoRestante = () => {
    if (!recurso?.fecha_entrega) return '—';
    const diff = new Date(recurso.fecha_entrega) - new Date();
    if (diff < 0) return tr('dt_deadlinePassed');
    const dias = Math.floor(diff / 86400000);
    const horas = Math.floor((diff % 86400000) / 3600000);
    return `${dias} ${tr('dt_days')} ${horas} ${tr('dt_hours')}`;
  };

  if (loading) return <div className="page-loading">Cargando tarea...</div>;

  return (
    <div className="detalle-tarea-page">
      <div className="page-card">

        <div className="page-card-header">
          <div className="page-header-row">
            <div>
              <h1 className="page-title">{curso?.nombre || tr('dt_courseTitle')}</h1>
              <p className="page-breadcrumb">
                <Link to="/dashboard">{tr('home')}</Link>
                <span> / </span>
                {curso && <Link to={`/curso/${curso.id}`}>{curso.nombre}</Link>}
                {modulo && <><span> / </span><span>{modulo.nombre}</span></>}
                {recurso && <><span> / </span><span>{recurso.titulo}</span></>}
              </p>
            </div>
            {isStaff && recurso && (
              <div className="page-admin-actions">
                <button className="btn-edit-recurso" onClick={openEditar}>{tr('dt_editResource')}</button>
                {isAdmin && (
                  <button className="btn-delete-recurso" onClick={handleEliminar}>{tr('dt_deleteResource')}</button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="tarea-body">
          <h2 className="tarea-titulo">{recurso?.titulo || 'Nombre de la Tarea'}</h2>
          <div className="tarea-descripcion">
            {recurso?.contenido || 'Descripción del recurso'}
          </div>

          {recurso?.ruta_archivo && (
            <div className="tarea-archivo">
              <a
                href={getFileUrl(recurso.ruta_archivo)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-descargar"
              >
                📎 {tr('dt_downloadFile')}
              </a>
            </div>
          )}

          {recurso?.es_entregable === 1 && !isStaff && (
            <>
              <h3 className="estado-titulo">{tr('dt_submissionStatus')}</h3>
              <table className="estado-table">
                <tbody>
                  <tr>
                    <td className="estado-label">{tr('dt_submissionStatus')}</td>
                    <td className="estado-value">
                      {miEntrega ? tr('dt_submitted') : tr('dt_noSubmission')}
                    </td>
                  </tr>
                  <tr>
                    <td className="estado-label">{tr('dt_gradeStatus')}</td>
                    <td className="estado-value">{tr('dt_notGraded')}</td>
                  </tr>
                  <tr>
                    <td className="estado-label">{tr('dt_dueDate')}</td>
                    <td className="estado-value">{formatFecha(recurso?.fecha_entrega)}</td>
                  </tr>
                  <tr>
                    <td className="estado-label">{tr('dt_timeRemaining')}</td>
                    <td className="estado-value">{tiempoRestante()}</td>
                  </tr>
                  {miEntrega && (
                    <>
                      <tr>
                        <td className="estado-label">{tr('dt_lastModified')}</td>
                        <td className="estado-value">{formatFecha(miEntrega.fecha_entrega)}</td>
                      </tr>
                      {miEntrega.contenido_enviado && (
                        <tr>
                          <td className="estado-label">{tr('dt_submissionComment')}</td>
                          <td className="estado-value">{miEntrega.contenido_enviado}</td>
                        </tr>
                      )}
                      {Array.isArray(miEntrega.ruta_archivo) && miEntrega.ruta_archivo.length > 0 && (
                        <tr>
                          <td className="estado-label">{tr('dt_submissionFiles')}</td>
                          <td className="estado-value">
                            {miEntrega.ruta_archivo.map((ruta, i) => (
                              <div key={i}>
                                <a href={getFileUrl(ruta)} target="_blank" rel="noopener noreferrer">
                                  📎 {ruta.split('/').pop()}
                                </a>
                              </div>
                            ))}
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>

              <div className="tarea-actions">
                <button
                  className="btn-agregar-entrega"
                  onClick={() => navigate(`/recurso/${id}/entrega`)}
                >
                  {miEntrega ? tr('dt_editSubmission') : tr('dt_addSubmission')}
                </button>
              </div>
            </>
          )}

          {recurso?.es_entregable === 1 && isStaff && (
            <div className="staff-entregas-section">
              <div className="staff-entregas-header">
                <h3 className="estado-titulo">{tr('dt_submissions')}</h3>
                <button
                  className="btn-ver-entregas"
                  onClick={mostrarEntregas ? () => setMostrarEntregas(false) : cargarTodasEntregas}
                  disabled={loadingEntregas}
                >
                  {loadingEntregas ? tr('loading') : mostrarEntregas ? '▲ Ocultar' : tr('dt_viewSubmissions')}
                </button>
              </div>

              {mostrarEntregas && (
                <div className="entregas-lista">
                  {todasEntregas.length === 0 ? (
                    <p className="no-data">{tr('dt_noSubmissions')}</p>
                  ) : (
                    todasEntregas.map((e, i) => (
                      <div key={i} className="entrega-card">
                        <div className="entrega-card-header">
                          <strong>{e.nombre ? `${e.nombre} ${e.apellidos || ''}`.trim() : e.nombre_usuario}</strong>
                          <span className="entrega-fecha">{formatFecha(e.fecha_entrega)}</span>
                        </div>
                        {e.contenido_enviado && (
                          <p className="entrega-contenido">{e.contenido_enviado}</p>
                        )}
                        {Array.isArray(e.ruta_archivo) && e.ruta_archivo.length > 0 && (
                          <div className="entrega-archivos">
                            {e.ruta_archivo.map((ruta, j) => (
                              <a key={j} href={getFileUrl(ruta)} target="_blank" rel="noopener noreferrer" className="entrega-archivo-link">
                                📎 {ruta.split('/').pop()}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(false)}>
          <div className="modal-box modal-box-lg" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{tr('cp_editResource')}</h3>

            <div className="modal-field">
              <label>{tr('cp_resourceTitle')}</label>
              <input
                type="text"
                value={editForm.titulo}
                onChange={e => setEditForm(f => ({ ...f, titulo: e.target.value }))}
                autoFocus
              />
            </div>

            <div className="modal-field">
              <label>{tr('cp_resourceContent')}</label>
              <textarea
                value={editForm.contenido}
                onChange={e => setEditForm(f => ({ ...f, contenido: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="modal-field modal-check">
              <label>
                <input
                  type="checkbox"
                  checked={editForm.es_entregable}
                  onChange={e => setEditForm(f => ({ ...f, es_entregable: e.target.checked }))}
                />
                {tr('cp_deliverable')}
              </label>
            </div>

            {editForm.es_entregable && (
              <div className="modal-field">
                <label>{tr('cp_dueDate')}</label>
                <input
                  type="date"
                  value={editForm.fecha_entrega}
                  onChange={e => setEditForm(f => ({ ...f, fecha_entrega: e.target.value }))}
                />
              </div>
            )}

            <div className="modal-field">
              <label>{tr('cp_replaceFile')}</label>
              <input
                type="file"
                onChange={e => setEditForm(f => ({ ...f, archivo: e.target.files[0] || null }))}
              />
            </div>

            {modalError && <p className="modal-error">{modalError}</p>}
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setEditModal(false)}>{tr('cancel')}</button>
              <button className="btn-modal-ok" onClick={submitEditar} disabled={saving}>
                {saving ? tr('saving') : tr('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleTarea;
