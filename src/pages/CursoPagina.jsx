import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getCursoById, getModulosByCurso, getRecursosByModulo,
  createModulo, updateModulo, deleteModulo,
  createRecurso, updateRecurso, deleteRecurso,
  updateCurso, deleteCurso,
} from '../api/cursos.api';
import './CursoPagina.css';

const EMPTY_MODULO = { nombre: '', url_imagen: '' };
const EMPTY_RECURSO = { titulo: '', contenido: '', es_entregable: false, fecha_entrega: '', archivo: null };

const CursoPagina = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isStaff = user?.roles?.includes('admin') || user?.roles?.includes('profesor');
  const isAdmin = user?.roles?.includes('admin');
  const toast = useToast();

  const [curso, setCurso] = useState(null);
  const [cursoModal, setCursoModal] = useState(false);
  const [cursoNombre, setCursoNombre] = useState('');
  const [cursoSaving, setCursoSaving] = useState(false);
  const [cursoError, setCursoError] = useState('');
  const [modulos, setModulos] = useState([]);
  const [moduloActivo, setModuloActivo] = useState(null);
  const [recursos, setRecursos] = useState([]);
  const [loadingRecursos, setLoadingRecursos] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gearOpen, setGearOpen] = useState(false);
  const gearRef = useRef(null);

  const [moduloModal, setModuloModal] = useState({ open: false, modo: 'crear', id: null });
  const [moduloForm, setModuloForm] = useState(EMPTY_MODULO);
  const [recursoModal, setRecursoModal] = useState({ open: false, modo: 'crear', id: null });
  const [recursoForm, setRecursoForm] = useState(EMPTY_RECURSO);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    Promise.all([getCursoById(id), getModulosByCurso(id)])
      .then(([cursoRes, modulosRes]) => {
        setCurso(cursoRes.data);
        setModulos(modulosRes.data);
        if (modulosRes.data.length > 0) setModuloActivo(modulosRes.data[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!moduloActivo) return;
    setLoadingRecursos(true);
    getRecursosByModulo(moduloActivo.id)
      .then(res => setRecursos(res.data))
      .catch(console.error)
      .finally(() => setLoadingRecursos(false));
  }, [moduloActivo?.id]);

  useEffect(() => {
    const handler = (e) => {
      if (gearRef.current && !gearRef.current.contains(e.target)) setGearOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Curso CRUD ───────────────────────────────────────────
  const openEditarCurso = () => {
    setCursoNombre(curso?.nombre || '');
    setCursoError('');
    setCursoModal(true);
    setGearOpen(false);
  };

  const submitEditarCurso = async () => {
    if (!cursoNombre.trim()) return setCursoError('El nombre es obligatorio');
    setCursoSaving(true);
    setCursoError('');
    try {
      const res = await updateCurso(id, { nombre: cursoNombre });
      setCurso(res.data);
      setCursoModal(false);
      toast('Curso actualizado correctamente');
    } catch (err) {
      setCursoError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setCursoSaving(false);
    }
  };

  const handleEliminarCurso = async () => {
    setGearOpen(false);
    if (!window.confirm(`¿Eliminar el curso "${curso?.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteCurso(id);
      navigate('/dashboard');
    } catch (err) {
      toast(err.response?.data?.message || 'Error al eliminar el curso', 'error');
    }
  };

  // ── Módulo CRUD ──────────────────────────────────────────
  const openCrearModulo = () => {
    setModuloForm(EMPTY_MODULO);
    setModalError('');
    setModuloModal({ open: true, modo: 'crear', id: null });
  };

  const openEditarModulo = (e, mod) => {
    e.stopPropagation();
    setModuloForm({ nombre: mod.nombre, url_imagen: mod.url_imagen || '' });
    setModalError('');
    setModuloModal({ open: true, modo: 'editar', id: mod.id });
  };

  const submitModulo = async () => {
    if (!moduloForm.nombre.trim()) return setModalError('El nombre es obligatorio');
    setSaving(true);
    setModalError('');
    try {
      const payload = { nombre: moduloForm.nombre };
      if (moduloForm.url_imagen.trim()) payload.url_imagen = moduloForm.url_imagen.trim();

      if (moduloModal.modo === 'crear') {
        const res = await createModulo({ id_curso: Number(id), ...payload });
        setModulos(prev => [...prev, res.data]);
        setModuloActivo(res.data);
      } else {
        const res = await updateModulo(moduloModal.id, payload);
        setModulos(prev => prev.map(m => m.id === moduloModal.id ? res.data : m));
        if (moduloActivo?.id === moduloModal.id) setModuloActivo(res.data);
      }
      setModuloModal({ open: false, modo: 'crear', id: null });
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModulo = async (e, mod) => {
    e.stopPropagation();
    if (!window.confirm(`¿Eliminar el módulo "${mod.nombre}"?`)) return;
    try {
      await deleteModulo(mod.id);
      toast('Módulo eliminado');
      setModulos(prev => {
        const filtered = prev.filter(m => m.id !== mod.id);
        if (moduloActivo?.id === mod.id) {
          setModuloActivo(filtered[0] || null);
          setRecursos([]);
        }
        return filtered;
      });
    } catch (err) {
      toast(err.response?.data?.message || 'Error al eliminar', 'error');
    }
  };

  // ── Recurso CRUD ─────────────────────────────────────────
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
      if (recursoModal.modo === 'crear') fd.append('id_modulo', String(moduloActivo.id));
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
      } else {
        const res = await updateRecurso(recursoModal.id, fd);
        setRecursos(prev => prev.map(r => r.id === recursoModal.id ? res.data : r));
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

  if (loading) return <div className="curso-loading">Cargando curso...</div>;

  return (
    <div className="curso-page">
      <div className="curso-grid">

        <div className="curso-main">
          <div className="curso-card">

            <div className="curso-card-header">
              <div className="curso-title-block">
                <h1 className="curso-title">{curso?.nombre || 'Título Del Curso'}</h1>
                <p className="curso-breadcrumb">
                  <Link to="/dashboard">Inicio</Link>
                  <span> / </span>
                  <span>{curso?.nombre || 'Curso'}</span>
                </p>
              </div>

              <div className="gear-wrapper" ref={gearRef}>
                <button className="gear-btn" onClick={() => setGearOpen(o => !o)}>
                  ⚙ <span className="gear-arrow">▼</span>
                </button>
                {gearOpen && (
                  <ul className="gear-dropdown">
                    <li onClick={() => { navigate(`/curso/${id}/calificaciones`); setGearOpen(false); }}>
                      Calificaciones
                    </li>
                    <li onClick={() => { navigate(`/curso/${id}/participantes`); setGearOpen(false); }}>
                      Participantes
                    </li>
                    {isStaff && <li onClick={openEditarCurso}>Editar ajustes</li>}
                    {isAdmin && <li className="gear-item-danger" onClick={handleEliminarCurso}>Eliminar curso</li>}
                  </ul>
                )}
              </div>
            </div>

            <div className="subcarpetas-section">
              <div className="subcarpetas-header">Subcarpetas</div>
              <div className="subcarpetas-list">
                {modulos.length === 0 ? (
                  <p className="empty-section">No hay módulos en este curso</p>
                ) : (
                  modulos.map(mod => (
                    <div
                      key={mod.id}
                      className={`subcarpeta-item ${moduloActivo?.id === mod.id ? 'active' : ''}`}
                      onClick={() => setModuloActivo(mod)}
                    >
                      <span className="subcarpeta-nombre">
                        {mod.url_imagen
                          ? <img src={mod.url_imagen} alt="" className="subcarpeta-img" onError={e => { e.target.style.display = 'none'; }} />
                          : <span className="subcarpeta-folder">📁</span>
                        }
                        {mod.nombre}
                      </span>
                      {isStaff && (
                        <span className="subcarpeta-actions">
                          <button className="icon-action" title="Editar" onClick={(e) => openEditarModulo(e, mod)}>✏️</button>
                          {isAdmin && (
                            <button className="icon-action" title="Eliminar" onClick={(e) => handleDeleteModulo(e, mod)}>🗑️</button>
                          )}
                        </span>
                      )}
                    </div>
                  ))
                )}
                {isStaff && (
                  <button className="btn-add-item" onClick={openCrearModulo}>＋ Nuevo módulo</button>
                )}
              </div>
            </div>

            <div className="contenido-section">
              {moduloActivo ? (
                <div className="contenido-body">
                  <div className="contenido-header-row">
                    <h3 className="contenido-modulo-title">{moduloActivo.nombre}</h3>
                    {isStaff && (
                      <button className="btn-add-recurso" onClick={openCrearRecurso}>＋ Nuevo recurso</button>
                    )}
                  </div>
                  {loadingRecursos ? (
                    <p className="contenido-placeholder-txt">Cargando recursos...</p>
                  ) : recursos.length === 0 ? (
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
              ) : (
                <p className="contenido-placeholder-txt">Selecciona un módulo</p>
              )}
            </div>
          </div>
        </div>

        <div className="curso-sidebar">
          <div className="widget-box">
            <div className="widget-header">Calendario</div>
            <div className="calendar-placeholder" />
          </div>
        </div>
      </div>

      {/* Modal: Editar Curso */}
      {cursoModal && (
        <div className="modal-overlay" onClick={() => setCursoModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Editar curso</h3>
            <div className="modal-field">
              <label>Nombre del curso</label>
              <input
                type="text"
                value={cursoNombre}
                onChange={e => setCursoNombre(e.target.value)}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && submitEditarCurso()}
              />
            </div>
            {cursoError && <p className="modal-error">{cursoError}</p>}
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setCursoModal(false)}>Cancelar</button>
              <button className="btn-modal-ok" onClick={submitEditarCurso} disabled={cursoSaving}>
                {cursoSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Módulo */}
      {moduloModal.open && (
        <div className="modal-overlay" onClick={() => setModuloModal(m => ({ ...m, open: false }))}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">
              {moduloModal.modo === 'crear' ? 'Nuevo módulo' : 'Editar módulo'}
            </h3>
            <div className="modal-field">
              <label>Nombre</label>
              <input
                type="text"
                value={moduloForm.nombre}
                onChange={e => setModuloForm(f => ({ ...f, nombre: e.target.value }))}
                placeholder="Nombre del módulo"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && submitModulo()}
              />
            </div>
            <div className="modal-field">
              <label>URL de imagen (opcional)</label>
              <input
                type="text"
                value={moduloForm.url_imagen}
                onChange={e => setModuloForm(f => ({ ...f, url_imagen: e.target.value }))}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              {moduloForm.url_imagen && (
                <img
                  src={moduloForm.url_imagen}
                  alt="Vista previa"
                  className="modal-img-preview"
                  onError={e => { e.target.style.display = 'none'; }}
                  onLoad={e => { e.target.style.display = 'block'; }}
                />
              )}
            </div>
            {modalError && <p className="modal-error">{modalError}</p>}
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setModuloModal(m => ({ ...m, open: false }))}>
                Cancelar
              </button>
              <button className="btn-modal-ok" onClick={submitModulo} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Recurso */}
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

export default CursoPagina;
