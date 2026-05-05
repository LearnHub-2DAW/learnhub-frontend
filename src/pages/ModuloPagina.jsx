import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getCursoById, 
  getModulosByCurso, 
  getRecursosByModulo,
  createRecurso, 
  updateRecurso, 
  deleteRecurso
} from '../api/cursos.api';
import './CursoPagina.css'; // Reutilizamos los mismos estilos

const EMPTY_RECURSO = { titulo: '', contenido: '', es_entregable: false, fecha_entrega: '', archivo: null };

const ModuloPagina = () => {
  // Capturamos el ID del curso y del módulo desde la URL
  const { id, idModulo } = useParams(); 
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const isStaff = user?.roles?.includes('admin') || user?.roles?.includes('profesor');
  const isAdmin = user?.roles?.includes('admin');

  const [curso, setCurso] = useState(null);
  const [modulo, setModulo] = useState(null);
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para el Modal de Recursos
  const [recursoModal, setRecursoModal] = useState({ open: false, modo: 'crear', id: null });
  const [recursoForm, setRecursoForm] = useState(EMPTY_RECURSO);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  // Cargar datos al montar la página
  useEffect(() => {
    setLoading(true);
    
    // 1. Cargamos la información del Curso y del Módulo juntos
    Promise.all([
      getCursoById(id),
      getModulosByCurso(id)
    ])
      .then(([cursoRes, modulosRes]) => {
        setCurso(cursoRes.data);
        const currentMod = modulosRes.data.find(m => m.id === Number(idModulo));
        setModulo(currentMod);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // 2. Cargamos los Recursos de forma INDEPENDIENTE
    getRecursosByModulo(idModulo)
      .then(res => setRecursos(res.data))
      .catch(err => {
        console.error("No se encontraron recursos:", err);
        setRecursos([]); // Si el servidor da error porque está vacío, mostramos la lista vacía
      });

  }, [id, idModulo]);

  // ── Lógica de Recursos CRUD ─────────────────────────────────────────
  const openCrearRecurso = () => {
    setRecursoForm(EMPTY_RECURSO);
    setModalError('');
    setRecursoModal({ open: true, modo: 'crear', id: null });
  };

  const openEditarRecurso = (e, r) => {
    e.stopPropagation();
    setRecursoForm({
      titulo: r.titulo,
      contenido: r.contenido || '',
      es_entregable: r.es_entregable === 1,
      fecha_entrega: r.fecha_entrega ? r.fecha_entrega.split('T')[0] : '',
      archivo: null,
    });
    setModalError('');
    setRecursoModal({ open: true, modo: 'editar', id: r.id });
  };

  const submitRecurso = async () => {
    if (!recursoForm.titulo.trim()) return setModalError('El título es obligatorio');
    setSaving(true);
    setModalError('');
    try {
      const fd = new FormData();
      if (recursoModal.modo === 'crear') fd.append('id_modulo', String(idModulo));
      fd.append('titulo', recursoForm.titulo);
      fd.append('contenido', recursoForm.contenido);
      fd.append('es_entregable', recursoForm.es_entregable ? 'true' : 'false');
      if (recursoForm.es_entregable && recursoForm.fecha_entrega) {
        fd.append('fecha_entrega', recursoForm.fecha_entrega);
      }
      if (recursoForm.archivo) fd.append('archivo', recursoForm.archivo);

      if (recursoModal.modo === 'crear') {
        const res = await createRecurso(fd);
        setRecursos(prev => [...prev, res.data]);
        toast('Recurso creado');
      } else {
        const res = await updateRecurso(recursoModal.id, fd);
        setRecursos(prev => prev.map(r => r.id === recursoModal.id ? res.data : r));
        toast('Recurso actualizado');
      }
      setRecursoModal({ open: false, modo: 'crear', id: null });
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecurso = async (e, r) => {
    e.stopPropagation();
    if (!window.confirm(`¿Eliminar el recurso "${r.titulo}"?`)) return;
    try {
      await deleteRecurso(r.id);
      toast('Recurso eliminado');
      setRecursos(prev => prev.filter(rec => rec.id !== r.id));
    } catch (err) {
      toast(err.response?.data?.message || 'Error al eliminar', 'error');
    }
  };

  if (loading) return <div className="curso-loading">Cargando módulo...</div>;

  return (
    <div className="curso-page">
      <div className="curso-grid">

        {/* ── COLUMNA PRINCIPAL ── */}
        <div className="curso-main">
          <div className="curso-card">
            
            {/* Header del Módulo */}
            <div className="curso-card-header">
              <div className="curso-title-block">
                <h1 className="curso-title">{modulo?.nombre || 'Módulo'}</h1>
                <p className="curso-breadcrumb">
                  <Link to="/dashboard">Inicio</Link>
                  <span> / </span>
                  <Link to={`/curso/${id}`}>{curso?.nombre || 'Curso'}</Link>
                  <span> / </span>
                  <span>{modulo?.nombre || 'Módulo'}</span>
                </p>
              </div>
            </div>

            {/* Contenido del Módulo (Recursos) */}
            <div className="contenido-section">
              <div className="contenido-body">
                <div className="contenido-header-row">
                  <h3 className="contenido-modulo-title">Contenido del módulo</h3>
                  {isStaff && (
                    <button className="btn-add-recurso" onClick={openCrearRecurso}>＋ Nuevo recurso</button>
                  )}
                </div>
                
                {recursos.length === 0 ? (
                  <p className="contenido-placeholder-txt">No hay recursos en este módulo</p>
                ) : (
                  <ul className="recursos-list">
                    {recursos.map(r => (
                      <li
                        key={r.id}
                        className="recurso-item"
                        onClick={() => navigate(`/recurso/${r.id}`)}
                      >
                        <span className="recurso-icon">{r.es_entregable === 1 ? '📝' : '📄'}</span>
                        <span className="recurso-titulo">{r.titulo}</span>
                        {r.es_entregable === 1 && r.fecha_entrega && (
                          <span className="recurso-fecha">
                            Entrega: {new Date(r.fecha_entrega).toLocaleDateString('es-ES')}
                          </span>
                        )}
                        {isStaff && (
                          <span className="recurso-actions">
                            <button className="icon-action" title="Editar" onClick={(e) => openEditarRecurso(e, r)}>✏️</button>
                            {isAdmin && (
                              <button className="icon-action" title="Eliminar" onClick={(e) => handleDeleteRecurso(e, r)}>🗑️</button>
                            )}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <div className="curso-sidebar">
          <div className="widget-box">
            <div className="widget-header">Calendario</div>
            <div className="calendar-placeholder" />
          </div>
        </div>

      </div>

      {/* ── MODAL: CREAR/EDITAR RECURSO ── */}
      {recursoModal.open && (
        <div className="modal-overlay" onClick={() => setRecursoModal(m => ({ ...m, open: false }))}>
          <div className="modal-box modal-box-lg" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">
              {recursoModal.modo === 'crear' ? 'Nuevo recurso' : 'Editar recurso'}
            </h3>

            <div className="modal-field">
              <label>Título</label>
              <input
                type="text"
                value={recursoForm.titulo}
                onChange={e => setRecursoForm(f => ({ ...f, titulo: e.target.value }))}
                placeholder="Título del recurso"
                autoFocus
              />
            </div>

            <div className="modal-field">
              <label>Contenido / Descripción</label>
              <textarea
                value={recursoForm.contenido}
                onChange={e => setRecursoForm(f => ({ ...f, contenido: e.target.value }))}
                placeholder="Descripción opcional"
                rows={3}
              />
            </div>

            <div className="modal-field modal-check">
              <label>
                <input
                  type="checkbox"
                  checked={recursoForm.es_entregable}
                  onChange={e => setRecursoForm(f => ({ ...f, es_entregable: e.target.checked }))}
                />
                Es una tarea entregable
              </label>
            </div>

            {recursoForm.es_entregable && (
              <div className="modal-field">
                <label>Fecha de entrega</label>
                <input
                  type="date"
                  value={recursoForm.fecha_entrega}
                  onChange={e => setRecursoForm(f => ({ ...f, fecha_entrega: e.target.value }))}
                />
              </div>
            )}

            <div className="modal-field">
              <label>Archivo adjunto (opcional)</label>
              <input
                type="file"
                onChange={e => setRecursoForm(f => ({ ...f, archivo: e.target.files[0] || null }))}
              />
            </div>

            {modalError && <p className="modal-error">{modalError}</p>}
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setRecursoModal(m => ({ ...m, open: false }))}>
                Cancelar
              </button>
              <button className="btn-modal-ok" onClick={submitRecurso} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuloPagina;