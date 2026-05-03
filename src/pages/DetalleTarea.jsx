import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getRecursoById, getModuloById, getCursoById, updateRecurso, deleteRecurso } from '../api/cursos.api';
import './DetalleTarea.css';

const EMPTY_FORM = { titulo: '', contenido: '', es_entregable: false, fecha_entrega: '', archivo: null };

const DetalleTarea = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isStaff = user?.roles?.includes('admin') || user?.roles?.includes('profesor');
  const isAdmin = user?.roles?.includes('admin');
  const toast = useToast();

  const [recurso, setRecurso] = useState(null);
  const [modulo, setModulo] = useState(null);
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);

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
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

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
          <div className="page-header-row">
            <div>
              <h1 className="page-title">{curso?.nombre || 'Título Del Curso'}</h1>
              <p className="page-breadcrumb">
                <Link to="/dashboard">Inicio</Link>
                <span> / </span>
                {curso && <Link to={`/curso/${curso.id}`}>{curso.nombre}</Link>}
                {modulo && <><span> / </span><span>{modulo.nombre}</span></>}
                {recurso && <><span> / </span><span>{recurso.titulo}</span></>}
              </p>
            </div>
            {isStaff && recurso && (
              <div className="page-admin-actions">
                <button className="btn-edit-recurso" onClick={openEditar}>✏️ Editar</button>
                {isAdmin && (
                  <button className="btn-delete-recurso" onClick={handleEliminar}>🗑️ Eliminar</button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="tarea-body">
          {/* Nombre y descripción */}
          <h2 className="tarea-titulo">{recurso?.titulo || 'Nombre de la Tarea'}</h2>
          <div className="tarea-descripcion">
            {recurso?.contenido || 'Descripción del recurso'}
          </div>

          {/* Archivo adjunto del recurso */}
          {recurso?.ruta_archivo && (
            <div className="tarea-archivo">
              <a
                href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${recurso.ruta_archivo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-descargar"
              >
                📎 Descargar archivo
              </a>
            </div>
          )}

          {/* Estado de la entrega */}
          {recurso?.es_entregable === 1 && (
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

      {/* Modal: Editar recurso */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(false)}>
          <div className="modal-box modal-box-lg" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Editar recurso</h3>

            <div className="modal-field">
              <label>Título</label>
              <input
                type="text"
                value={editForm.titulo}
                onChange={e => setEditForm(f => ({ ...f, titulo: e.target.value }))}
                autoFocus
              />
            </div>

            <div className="modal-field">
              <label>Contenido / Descripción</label>
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
                Es una tarea entregable
              </label>
            </div>

            {editForm.es_entregable && (
              <div className="modal-field">
                <label>Fecha de entrega</label>
                <input
                  type="date"
                  value={editForm.fecha_entrega}
                  onChange={e => setEditForm(f => ({ ...f, fecha_entrega: e.target.value }))}
                />
              </div>
            )}

            <div className="modal-field">
              <label>Reemplazar archivo adjunto (opcional)</label>
              <input
                type="file"
                onChange={e => setEditForm(f => ({ ...f, archivo: e.target.files[0] || null }))}
              />
            </div>

            {modalError && <p className="modal-error">{modalError}</p>}
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setEditModal(false)}>Cancelar</button>
              <button className="btn-modal-ok" onClick={submitEditar} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleTarea;
