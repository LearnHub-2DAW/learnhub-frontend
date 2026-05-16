import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLang } from '../../context/LangContext';
import {
  getCursoById, getModulosByCurso, getRecursosByModulo,
  createModulo, updateModulo, deleteModulo,
  createRecurso, updateRecurso, deleteRecurso,
  updateCurso, deleteCurso,
  enrollModulo, unenrollModulo,
  getModuloClave, regenerarClave,
} from '../../api/cursos.api';
import { getMisModulos, getProfesores } from '../../api/usuario.api';
import { getFileUrl } from '../../api/axios';
import './CursoPagina.css';

const EMPTY_MODULO = { nombre: '', imagenFile: null, currentImg: '', id_profesor: '' };
const modImgUrl = (u) => !u ? null : u.startsWith('http') ? u : getFileUrl(u);
const EMPTY_RECURSO = { titulo: '', contenido: '', es_entregable: false, fecha_entrega: '', archivo: null };

const CursoPagina = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: navState } = useLocation();
  const { user } = useAuth();

  const isStaff = user?.roles?.includes('admin') || user?.roles?.includes('profesor');
  const isAdmin = user?.roles?.includes('admin');
  const toast = useToast();
  const { tr } = useLang();

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

  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [enrollingId, setEnrollingId] = useState(null);

  // Modal matrícula por clave (alumno)
  const [enrollModal, setEnrollModal] = useState({ open: false, mod: null });
  const [claveInput, setClaveInput] = useState('');
  const [enrollError, setEnrollError] = useState('');

  // Modal ver/regenerar clave (staff)
  const [claveModal, setClaveModal] = useState({ open: false, mod: null });
  const [claveActual, setClaveActual] = useState('');
  const [loadingClave, setLoadingClave] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const [profesores, setProfesores] = useState([]);
  const [moduloModal, setModuloModal] = useState({ open: false, modo: 'crear', id: null });
  const [moduloForm, setModuloForm] = useState(EMPTY_MODULO);
  const [recursoModal, setRecursoModal] = useState({ open: false, modo: 'crear', id: null });
  const [recursoForm, setRecursoForm] = useState(EMPTY_RECURSO);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    if (isAdmin) {
      getProfesores().then(r => setProfesores(r.data)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const promises = [getCursoById(id), getModulosByCurso(id)];
    if (!isStaff) promises.push(getMisModulos().catch(() => ({ data: [] })));

    Promise.all(promises)
      .then(([cursoRes, modulosRes, modulosUsuarioRes]) => {
        setCurso(cursoRes.data);
        setModulos(modulosRes.data);
        if (modulosRes.data.length > 0) {
          const target = navState?.activarModuloId
            ? modulosRes.data.find(m => m.id === navState.activarModuloId)
            : null;
          setModuloActivo(target || modulosRes.data[0]);
        }
        if (modulosUsuarioRes) {
          setEnrolledIds(new Set((modulosUsuarioRes.data || []).map(m => m.id)));
        }
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
    if (!cursoNombre.trim()) return setCursoError(tr('cp_nameRequired'));
    setCursoSaving(true);
    setCursoError('');
    try {
      const res = await updateCurso(id, { nombre: cursoNombre });
      setCurso(res.data);
      setCursoModal(false);
      toast(tr('cp_courseUpdated'));
    } catch (err) {
      setCursoError(err.response?.data?.message || tr('cp_errorSave'));
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
      toast(err.response?.data?.message || tr('ap_errorDelete'), 'error');
    }
  };

  // ── Matriculación ────────────────────────────────────────
  const handleEnroll = (e, mod) => {
    e.stopPropagation();
    if (enrolledIds.has(mod.id)) {
      handleUnenroll(mod);
    } else {
      const clavePendiente = sessionStorage.getItem('claveMatriculaPendiente') || '';
      setClaveInput(clavePendiente);
      setEnrollError('');
      setEnrollModal({ open: true, mod });
    }
  };

  const handleUnenroll = async (mod) => {
    setEnrollingId(mod.id);
    try {
      await unenrollModulo(mod.id);
      setEnrolledIds(prev => { const s = new Set(prev); s.delete(mod.id); return s; });
      toast(tr('cp_unenroll') + ': ' + mod.nombre);
    } catch (err) {
      toast(err.response?.data?.message || err.response?.data?.error || 'Error', 'error');
    } finally {
      setEnrollingId(null);
    }
  };

  const submitEnroll = async () => {
    if (!claveInput.trim()) return setEnrollError(tr('cp_key_required'));
    setEnrollingId(enrollModal.mod.id);
    setEnrollError('');
    try {
      await enrollModulo(enrollModal.mod.id, claveInput.trim());
      setEnrolledIds(prev => new Set([...prev, enrollModal.mod.id]));
      sessionStorage.removeItem('claveMatriculaPendiente');
      toast(tr('cp_enrolled') + ': ' + enrollModal.mod.nombre);
      setEnrollModal({ open: false, mod: null });
    } catch (err) {
      setEnrollError(err.response?.data?.error || err.response?.data?.message || 'Clave incorrecta');
    } finally {
      setEnrollingId(null);
    }
  };

  // ── Clave de matrícula (staff) ───────────────────────────
  const openClaveModal = async (e, mod) => {
    e.stopPropagation();
    setClaveActual('');
    setCopiado(false);
    setClaveModal({ open: true, mod });
    setLoadingClave(true);
    try {
      const res = await getModuloClave(mod.id);
      setClaveActual(res.data.clave_matricula);
    } catch (err) {
      toast(err.response?.data?.error || 'Error al obtener la clave', 'error');
      setClaveModal({ open: false, mod: null });
    } finally {
      setLoadingClave(false);
    }
  };

  const handleRegenerar = async () => {
    setLoadingClave(true);
    try {
      const res = await regenerarClave(claveModal.mod.id);
      setClaveActual(res.data.clave_matricula);
      setCopiado(false);
      toast(tr('cp_key_regenerated'));
    } catch (err) {
      toast(err.response?.data?.error || 'Error al regenerar', 'error');
    } finally {
      setLoadingClave(false);
    }
  };

  const handleCopiarClave = () => {
    navigator.clipboard.writeText(claveActual).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  // ── Módulo CRUD ──────────────────────────────────────────
  const openCrearModulo = () => {
    setModuloForm(EMPTY_MODULO);
    setModalError('');
    setModuloModal({ open: true, modo: 'crear', id: null });
  };

  const openEditarModulo = (e, mod) => {
    e.stopPropagation();
    setModuloForm({ nombre: mod.nombre, imagenFile: null, currentImg: mod.url_imagen || '', id_profesor: mod.id_profesor ? String(mod.id_profesor) : '' });
    setModalError('');
    setModuloModal({ open: true, modo: 'editar', id: mod.id });
  };

  const submitModulo = async () => {
    if (!moduloForm.nombre.trim()) return setModalError(tr('cp_nameRequired'));
    setSaving(true);
    setModalError('');
    try {
      const fd = new FormData();
      fd.append('nombre', moduloForm.nombre);
      if (isAdmin) fd.append('id_profesor', moduloForm.id_profesor ? String(moduloForm.id_profesor) : '');
      if (moduloForm.imagenFile) fd.append('imagen', moduloForm.imagenFile);

      if (moduloModal.modo === 'crear') {
        fd.append('id_curso', String(id));
        const res = await createModulo(fd);
        setModulos(prev => [...prev, res.data]);
        setModuloActivo(res.data);
      } else {
        const res = await updateModulo(moduloModal.id, fd);
        setModulos(prev => prev.map(m => m.id === moduloModal.id ? res.data : m));
        if (moduloActivo?.id === moduloModal.id) setModuloActivo(res.data);
      }
      setModuloModal({ open: false, modo: 'crear', id: null });
    } catch (err) {
      setModalError(err.response?.data?.message || tr('cp_errorSave'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModulo = async (e, mod) => {
    e.stopPropagation();
    if (!window.confirm(`¿Eliminar el módulo "${mod.nombre}"?`)) return;
    try {
      await deleteModulo(mod.id);
      toast(tr('cp_moduleDeleted'));
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
    if (!recursoForm.titulo.trim()) return setModalError(tr('cp_titleRequired'));
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
      setModalError(err.response?.data?.message || tr('cp_errorSave'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecurso = async (e, r) => {
    e.stopPropagation();
    if (!window.confirm(`¿Eliminar el recurso "${r.titulo}"?`)) return;
    try {
      await deleteRecurso(r.id);
      toast(tr('cp_resourceDeleted'));
      setRecursos(prev => prev.filter(rec => rec.id !== r.id));
    } catch (err) {
      toast(err.response?.data?.message || 'Error al eliminar', 'error');
    }
  };

  if (loading) return <div className="curso-loading">{tr('cp_loadingCourse')}</div>;

  return (
    <div className="curso-page">
      <div className="curso-grid">

        <div className="curso-main">
          <div className="curso-card">

            <div className="curso-card-header">
              <div className="curso-title-block">
                <h1 className="curso-title">{curso?.nombre || 'Título Del Curso'}</h1>
                <p className="curso-breadcrumb">
                  <Link to="/dashboard">{tr('home')}</Link>
                  <span className="bc-sep"> / </span>
                  {moduloActivo
                    ? <span className="bc-link" onClick={() => setModuloActivo(null)}>{curso?.nombre || 'Curso'}</span>
                    : <span>{curso?.nombre || 'Curso'}</span>
                  }
                  {moduloActivo && (
                    <>
                      <span className="bc-sep"> / </span>
                      <span>{moduloActivo.nombre}</span>
                    </>
                  )}
                </p>
              </div>

              <div className="gear-wrapper" ref={gearRef}>
                <button className="gear-btn" onClick={() => setGearOpen(o => !o)}>
                  ⚙ <span className="gear-arrow">▼</span>
                </button>
                {gearOpen && (
                  <ul className="gear-dropdown">
                    <li onClick={() => { navigate(`/curso/${id}/calificaciones`); setGearOpen(false); }}>
                      {tr('h_grades')}
                    </li>
                    <li onClick={() => { navigate(`/curso/${id}/participantes`); setGearOpen(false); }}>
                      {tr('cp_participants')}
                    </li>
                    {isStaff && <li onClick={openEditarCurso}>{tr('cp_editSettings')}</li>}
                    {isAdmin && <li className="gear-item-danger" onClick={handleEliminarCurso}>{tr('cp_deleteCourse')}</li>}
                  </ul>
                )}
              </div>
            </div>

            <div className="subcarpetas-section">
              <div className="subcarpetas-header">{tr('cp_subfolders')}</div>
              <div className="subcarpetas-list">
                {modulos.length === 0 ? (
                  <p className="empty-section">{tr('cp_noModulesInCourse')}</p>
                ) : (
                  modulos.map(mod => (
                    <div
                      key={mod.id}
                      className={`subcarpeta-item ${moduloActivo?.id === mod.id ? 'active' : ''}`}
                      onClick={() => setModuloActivo(mod)}
                    >
                      <span className="subcarpeta-nombre">
                        {mod.url_imagen
                          ? <img src={modImgUrl(mod.url_imagen)} alt="" className="subcarpeta-img" onError={e => { e.target.style.display = 'none'; }} />
                          : <span className="subcarpeta-folder">📁</span>
                        }
                        {mod.nombre}
                      </span>
                      {isStaff ? (
                        <span className="subcarpeta-actions">
                          <button className="icon-action" title={tr('cp_key_view')} onClick={(e) => openClaveModal(e, mod)}>🔑</button>
                          <button className="icon-action" title={tr('edit')} onClick={(e) => openEditarModulo(e, mod)}>✏️</button>
                          {isAdmin && (
                            <button className="icon-action" title={tr('delete')} onClick={(e) => handleDeleteModulo(e, mod)}>🗑️</button>
                          )}
                        </span>
                      ) : (
                        <button
                          className={`btn-enroll-modulo ${enrolledIds.has(mod.id) ? 'enrolled' : ''}`}
                          onClick={(e) => handleEnroll(e, mod)}
                          disabled={enrollingId === mod.id}
                        >
                          {enrollingId === mod.id
                            ? tr('cp_enrolling')
                            : enrolledIds.has(mod.id)
                              ? tr('cp_unenroll')
                              : tr('cp_enroll')}
                        </button>
                      )}
                    </div>
                  ))
                )}
                {isStaff && (
                  <button className="btn-add-item" onClick={openCrearModulo}>{tr('cp_newModule')}</button>
                )}
              </div>
            </div>

            <div className="contenido-section">
              {moduloActivo ? (
                <div className="contenido-body">
                  <div className="contenido-header-row">
                    <h3 className="contenido-modulo-title">{moduloActivo.nombre}</h3>
                    {isStaff && (
                      <button className="btn-add-recurso" onClick={openCrearRecurso}>{tr('cp_newResource')}</button>
                    )}
                  </div>
                  {loadingRecursos ? (
                    <p className="contenido-placeholder-txt">{tr('cp_loadingResources')}</p>
                  ) : recursos.length === 0 ? (
                    <p className="contenido-placeholder-txt">{tr('cp_noResources')}</p>
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
                              {tr('cp_dueDate')}: {new Date(r.fecha_entrega).toLocaleDateString()}
                            </span>
                          )}
                          {isStaff && (
                            <span className="recurso-actions">
                              <button className="icon-action" title={tr('edit')} onClick={(e) => openEditarRecurso(e, r)}>✏️</button>
                              {isAdmin && (
                                <button className="icon-action" title={tr('delete')} onClick={(e) => handleDeleteRecurso(e, r)}>🗑️</button>
                              )}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <p className="contenido-placeholder-txt">{tr('cp_selectModule')}</p>
              )}
            </div>
          </div>
        </div>

        <div className="curso-sidebar">
          <div className="widget-box">
            <div className="widget-header">{tr('cp_upcoming_tasks')}</div>
            <ul className="sidebar-tasks-list">
              {(() => {
                const now = new Date();
                const tareas = recursos
                  .filter(r => r.es_entregable === 1 && r.fecha_entrega && new Date(r.fecha_entrega) >= now)
                  .sort((a, b) => new Date(a.fecha_entrega) - new Date(b.fecha_entrega));
                if (tareas.length === 0) return (
                  <li className="sidebar-task-empty">{tr('cp_no_upcoming')}</li>
                );
                return tareas.map(t => (
                  <li key={t.id} className="sidebar-task-item" onClick={() => navigate(`/recurso/${t.id}`)}>
                    <span className="sidebar-task-fecha">
                      {new Date(t.fecha_entrega).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </span>
                    <span className="sidebar-task-titulo">📝 {t.titulo}</span>
                  </li>
                ));
              })()}
            </ul>
          </div>
        </div>
      </div>

      {/* Modal: Editar Curso */}
      {cursoModal && (
        <div className="modal-overlay" onClick={() => setCursoModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{tr('cp_editCourse')}</h3>
            <div className="modal-field">
              <label>{tr('cp_courseNameLabel')}</label>
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
              <button className="btn-modal-cancel" onClick={() => setCursoModal(false)}>{tr('cancel')}</button>
              <button className="btn-modal-ok" onClick={submitEditarCurso} disabled={cursoSaving}>
                {cursoSaving ? tr('saving') : tr('save')}
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
              {moduloModal.modo === 'crear' ? tr('cp_newModuleTitle') : tr('cp_editModule')}
            </h3>
            <div className="modal-field">
              <label>{tr('cp_moduleNameLabel')}</label>
              <input
                type="text"
                value={moduloForm.nombre}
                onChange={e => setModuloForm(f => ({ ...f, nombre: e.target.value }))}
                placeholder={tr('cp_moduleName')}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && submitModulo()}
              />
            </div>
            <div className="modal-field">
              <label>{tr('cp_moduleImage')}</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setModuloForm(f => ({ ...f, imagenFile: e.target.files[0] || null }))}
              />
              {(moduloForm.imagenFile || moduloForm.currentImg) && (
                <img
                  src={moduloForm.imagenFile ? URL.createObjectURL(moduloForm.imagenFile) : modImgUrl(moduloForm.currentImg)}
                  alt={tr('cp_imagePreview')}
                  className="modal-img-preview"
                  style={{ display: 'block' }}
                />
              )}
            </div>
            {isAdmin && (
              <div className="modal-field">
                <label>{tr('cp_profesor_label')}</label>
                <select
                  value={moduloForm.id_profesor}
                  onChange={e => setModuloForm(f => ({ ...f, id_profesor: e.target.value }))}
                >
                  <option value="">{tr('cp_no_profesor')}</option>
                  {profesores.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre ? `${p.nombre} ${p.apellidos || ''}`.trim() : p.nombre_usuario}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {modalError && <p className="modal-error">{modalError}</p>}
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setModuloModal(m => ({ ...m, open: false }))}>
                {tr('cancel')}
              </button>
              <button className="btn-modal-ok" onClick={submitModulo} disabled={saving}>
                {saving ? tr('saving') : tr('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Matricularse por clave (alumno) */}
      {enrollModal.open && (
        <div className="modal-overlay" onClick={() => setEnrollModal({ open: false, mod: null })}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{tr('cp_enroll')} — {enrollModal.mod?.nombre}</h3>
            <div className="modal-field">
              <label>{tr('cp_enroll_key_label')}</label>
              <input
                type="text"
                value={claveInput}
                onChange={e => setClaveInput(e.target.value)}
                placeholder={tr('cp_enroll_key_placeholder')}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && submitEnroll()}
              />
            </div>
            {enrollError && <p className="modal-error">{enrollError}</p>}
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setEnrollModal({ open: false, mod: null })}>{tr('cancel')}</button>
              <button className="btn-modal-ok" onClick={submitEnroll} disabled={enrollingId === enrollModal.mod?.id}>
                {enrollingId === enrollModal.mod?.id ? tr('cp_enrolling') : tr('cp_enroll')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Clave de matrícula (staff) */}
      {claveModal.open && (
        <div className="modal-overlay" onClick={() => setClaveModal({ open: false, mod: null })}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{tr('cp_enroll_key_label')} — {claveModal.mod?.nombre}</h3>
            {loadingClave ? (
              <p style={{ color: 'var(--text-muted)', margin: '12px 0' }}>{tr('loading')}</p>
            ) : (
              <>
                <div className="clave-display">
                  <code className="clave-code">{claveActual}</code>
                  <button className="btn-copiar-clave" onClick={handleCopiarClave}>
                    {copiado ? `✓ ${tr('cp_key_copied')}` : `📋 ${tr('cp_key_copy')}`}
                  </button>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '10px 0 0' }}>
                  {tr('cp_key_share_hint')}
                </p>
              </>
            )}
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setClaveModal({ open: false, mod: null })}>{tr('cancel')}</button>
              <button className="btn-modal-ok" onClick={handleRegenerar} disabled={loadingClave}>
                🔄 {tr('cp_key_regen')}
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
              {recursoModal.modo === 'crear' ? tr('cp_newResourceTitle') : tr('cp_editResource')}
            </h3>

            <div className="modal-field">
              <label>{tr('cp_resourceTitle')}</label>
              <input
                type="text"
                value={recursoForm.titulo}
                onChange={e => setRecursoForm(f => ({ ...f, titulo: e.target.value }))}
                placeholder={tr('cp_resourceTitle')}
                autoFocus
              />
            </div>

            <div className="modal-field">
              <label>{tr('cp_resourceContent')}</label>
              <textarea
                value={recursoForm.contenido}
                onChange={e => setRecursoForm(f => ({ ...f, contenido: e.target.value }))}
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
                {tr('cp_deliverable')}
              </label>
            </div>

            {recursoForm.es_entregable && (
              <div className="modal-field">
                <label>{tr('cp_dueDate')}</label>
                <input
                  type="date"
                  value={recursoForm.fecha_entrega}
                  onChange={e => setRecursoForm(f => ({ ...f, fecha_entrega: e.target.value }))}
                />
              </div>
            )}

            <div className="modal-field">
              <label>{tr('cp_attachFile')}</label>
              <input
                type="file"
                onChange={e => setRecursoForm(f => ({ ...f, archivo: e.target.files[0] || null }))}
              />
            </div>

            {modalError && <p className="modal-error">{modalError}</p>}
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setRecursoModal(m => ({ ...m, open: false }))}>
                {tr('cancel')}
              </button>
              <button className="btn-modal-ok" onClick={submitRecurso} disabled={saving}>
                {saving ? tr('saving') : tr('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CursoPagina;
