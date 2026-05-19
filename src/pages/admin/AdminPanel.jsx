import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { useToast } from '../../context/ToastContext';
import {
  getUsuarios, getUsuarioById, updateUsuarioAdmin,
  deleteUsuarioAdmin, changeRolUsuario, getModulosDeUsuario,
} from '../../api/usuario.api';
import {
  getCursos, getModulosByCurso,
  createCurso, updateCurso, deleteCurso,
  createModulo, updateModulo, deleteModulo,
  enrollUsuario, unenrollUsuario, getEnrolledUsers,
} from '../../api/cursos.api';
import { buscarUsuarios } from '../../api/usuario.api';
import { lanzarBoletinDiario, lanzarBoletinSemanal } from '../../api/notificaciones.api';
import './AdminPanel.css';

const ROLES = ['admin', 'profesor', 'alumno'];

const AdminPanel = () => {
  const { user } = useAuth();
  const { tr } = useLang();
  const toast = useToast();

  const isAdmin    = user?.roles?.includes('admin');
  const isProfesor = user?.roles?.includes('profesor');
  if (!isAdmin && !isProfesor) return <Navigate to="/dashboard" replace />;

  const secciones = isAdmin ? ['usuarios', 'cursos', 'notificaciones'] : ['cursos'];
  const [activa, setActiva] = useState(secciones[0]);

  // ── DATOS COMPARTIDOS ─────────────────────────────────────────────────────
  const [cursos,   setCursos]   = useState([]);
  const [modulos,  setModulos]  = useState({});   // { cursoId: [...] }
  const [usuarios, setUsuarios] = useState([]);

  // Cargar cursos en montaje (los usan ambas secciones)
  useEffect(() => {
    getCursos().then(r => setCursos(r.data)).catch(() => {});
  }, []);

  // Cargar usuarios al montar si es admin
  useEffect(() => {
    if (!isAdmin) return;
    getUsuarios()
      .then(r => {
        setUsuarios(r.data);
        const init = {};
        r.data.forEach(u => { init[u.id] = u.roles?.[0] || 'alumno'; });
        setRolesEdit(init);
      })
      .catch(() => toast(tr('ap_errorLoad'), 'error'));
  }, []);

  const loadModulos = async (cursoId) => {
    if (modulos[cursoId]) return modulos[cursoId];
    try {
      const r = await getModulosByCurso(cursoId);
      setModulos(prev => ({ ...prev, [cursoId]: r.data }));
      return r.data;
    } catch {
      setModulos(prev => ({ ...prev, [cursoId]: [] }));
      return [];
    }
  };

  const profesores = usuarios.filter(u => u.roles?.includes('profesor'));

  // ── SECCIÓN USUARIOS ──────────────────────────────────────────────────────
  const [rolesEdit,      setRolesEdit]      = useState({});
  const [savingRol,      setSavingRol]      = useState({});
  const [filtro,         setFiltro]         = useState('');
  const [expandedId,     setExpandedId]     = useState(null);
  const [userTab,        setUserTab]        = useState('perfil');
  const [editForm,       setEditForm]       = useState({});
  const [savingEdit,     setSavingEdit]     = useState(false);
  const [userModulos,    setUserModulos]    = useState(null);
  const [loadingExpand,  setLoadingExpand]  = useState(false);
  const [enrollCursoId,  setEnrollCursoId]  = useState('');
  const [enrollModuloId, setEnrollModuloId] = useState('');
  const [enrolling,      setEnrolling]      = useState(false);

  const toggleExpand = async (u) => {
    if (expandedId === u.id) { setExpandedId(null); return; }
    setExpandedId(u.id);
    setUserTab('perfil');
    setUserModulos(null);
    setEnrollCursoId('');
    setEnrollModuloId('');
    setLoadingExpand(true);
    try {
      const r = await getUsuarioById(u.id);
      const d = r.data;
      setEditForm({ nombre: d.nombre || '', apellidos: d.apellidos || '', ciudad: d.ciudad || '', pais: d.pais || '' });
    } finally {
      setLoadingExpand(false);
    }
  };

  const openModulosTab = async (userId) => {
    setUserTab('modulos');
    if (userModulos !== null) return;
    const r = await getModulosDeUsuario(userId).catch(() => ({ data: [] }));
    setUserModulos(r.data);
  };

  const handleSaveEdit = async (userId) => {
    setSavingEdit(true);
    try {
      await updateUsuarioAdmin(userId, editForm);
      setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, ...editForm } : u));
      toast(tr('ep_saved'));
    } catch {
      toast(tr('ep_errorSave'), 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleChangeRol = async (id) => {
    setSavingRol(prev => ({ ...prev, [id]: true }));
    try {
      await changeRolUsuario(id, rolesEdit[id]);
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, roles: [rolesEdit[id]] } : u));
      toast(tr('ap_roleUpdated'));
    } catch {
      toast(tr('ap_errorRole'), 'error');
    } finally {
      setSavingRol(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDeleteUser = async (u) => {
    if (!window.confirm(`¿Eliminar a ${u.nombre_usuario}?`)) return;
    try {
      await deleteUsuarioAdmin(u.id);
      setUsuarios(prev => prev.filter(x => x.id !== u.id));
      if (expandedId === u.id) setExpandedId(null);
      toast(tr('ap_userDeleted'));
    } catch {
      toast(tr('ap_errorUser'), 'error');
    }
  };

  const handleUnenroll = async (userId, mod) => {
    try {
      await unenrollUsuario(mod.id, userId);
      setUserModulos(prev => prev.filter(m => m.id !== mod.id));
      toast(`${tr('ap_unenrolled')}: ${mod.nombre}`);
    } catch {
      toast(tr('ap_errorUnenroll'), 'error');
    }
  };

  const handleEnroll = async (userId) => {
    if (!enrollModuloId) return;
    setEnrolling(true);
    try {
      await enrollUsuario(Number(enrollModuloId), userId);
      const r = await getModulosDeUsuario(userId);
      setUserModulos(r.data);
      setEnrollCursoId('');
      setEnrollModuloId('');
      toast(tr('ap_enrolled'));
    } catch (e) {
      toast(e.response?.data?.error || tr('ap_errorEnroll'), 'error');
    } finally {
      setEnrolling(false);
    }
  };

  const modulosCursoEnroll = enrollCursoId ? (modulos[enrollCursoId] || []) : [];
  const modulosDisponibles = modulosCursoEnroll.filter(m => !userModulos?.some(um => um.id === m.id));

  const usuariosFiltrados = usuarios.filter(u =>
    `${u.nombre_usuario} ${u.nombre || ''} ${u.apellidos || ''} ${u.correo_electronico}`
      .toLowerCase().includes(filtro.toLowerCase())
  );

  // ── SECCIÓN NOTIFICACIONES ────────────────────────────────────────────────
  const [sendingDiario,  setSendingDiario]  = useState(false);
  const [sendingSemanal, setSendingSemanal] = useState(false);

  const handleBoletinDiario = async () => {
    setSendingDiario(true);
    try {
      await lanzarBoletinDiario();
      toast('Boletín diario enviado correctamente');
    } catch {
      toast('Error al enviar el boletín diario', 'error');
    } finally {
      setSendingDiario(false);
    }
  };

  const handleBoletinSemanal = async () => {
    setSendingSemanal(true);
    try {
      await lanzarBoletinSemanal();
      toast('Boletín semanal enviado correctamente');
    } catch {
      toast('Error al enviar el boletín semanal', 'error');
    } finally {
      setSendingSemanal(false);
    }
  };

  // ── SECCIÓN CURSOS ────────────────────────────────────────────────────────
  const [loadingCursos,   setLoadingCursos]   = useState(false);
  const [expandidosCurso, setExpandidosCurso] = useState(new Set());
  const [nuevoCursoNombre, setNuevoCursoNombre] = useState('');
  const [savingCurso,    setSavingCurso]    = useState(false);
  const [editandoCurso,  setEditandoCurso]  = useState(null);
  const [showModForm,    setShowModForm]    = useState({});
  const [nuevoMod,       setNuevoMod]       = useState({});
  const [savingMod,      setSavingMod]      = useState({});
  const [editandoMod,    setEditandoMod]    = useState(null);

  // Matrículas por módulo (sección Cursos)
  const [modMatriculas,     setModMatriculas]     = useState({});  // { modId: [...usuarios] }
  const [expandedModMat,    setExpandedModMat]    = useState(null); // modId abierto
  const [matSearch,         setMatSearch]         = useState('');
  const [matSearchResults,  setMatSearchResults]  = useState([]);
  const [matSearchLoading,  setMatSearchLoading]  = useState(false);
  const [matEnrolling,      setMatEnrolling]      = useState(false);
  const matSearchTimer = React.useRef(null);

  const canManageMod = (mod) => isAdmin || mod.id_profesor === user.id;

  const toggleModMat = async (mod) => {
    if (expandedModMat === mod.id) { setExpandedModMat(null); return; }
    setExpandedModMat(mod.id);
    setMatSearch('');
    setMatSearchResults([]);
    if (modMatriculas[mod.id]) return;
    const r = await getEnrolledUsers(mod.id).catch(() => ({ data: [] }));
    setModMatriculas(prev => ({ ...prev, [mod.id]: r.data }));
  };

  const handleMatSearch = (q) => {
    setMatSearch(q);
    clearTimeout(matSearchTimer.current);
    if (!q.trim()) { setMatSearchResults([]); return; }
    setMatSearchLoading(true);
    matSearchTimer.current = setTimeout(() => {
      buscarUsuarios(q.trim())
        .then(r => setMatSearchResults(r.data))
        .catch(() => setMatSearchResults([]))
        .finally(() => setMatSearchLoading(false));
    }, 300);
  };

  const handleModEnroll = async (modId, userId) => {
    setMatEnrolling(true);
    try {
      await enrollUsuario(modId, userId);
      const r = await getEnrolledUsers(modId);
      setModMatriculas(prev => ({ ...prev, [modId]: r.data }));
      setMatSearch('');
      setMatSearchResults([]);
      toast(tr('ap_enrolled'));
    } catch (e) {
      toast(e.response?.data?.error || tr('ap_errorEnroll'), 'error');
    } finally {
      setMatEnrolling(false);
    }
  };

  const handleModUnenroll = async (modId, userId) => {
    try {
      await unenrollUsuario(modId, userId);
      setModMatriculas(prev => ({ ...prev, [modId]: prev[modId].filter(u => u.id !== userId) }));
      toast(tr('ap_unenrolled'));
    } catch {
      toast(tr('ap_errorUnenroll'), 'error');
    }
  };

  useEffect(() => {
    if (activa !== 'cursos') return;
    setLoadingCursos(true);
    getCursos().then(r => setCursos(r.data)).catch(() => toast(tr('ap_errorLoad'), 'error')).finally(() => setLoadingCursos(false));
  }, [activa]);

  const toggleExpandCurso = (cursoId) => {
    setExpandidosCurso(prev => {
      const next = new Set(prev);
      if (next.has(cursoId)) { next.delete(cursoId); }
      else { next.add(cursoId); loadModulos(cursoId); }
      return next;
    });
  };

  const handleCreateCurso = async () => {
    if (!nuevoCursoNombre.trim()) return;
    setSavingCurso(true);
    try {
      const r = await createCurso({ nombre: nuevoCursoNombre.trim() });
      setCursos(prev => [...prev, r.data]);
      setNuevoCursoNombre('');
      toast(tr('ap_courseCreated'));
    } catch { toast(tr('ap_errorSave'), 'error'); }
    finally { setSavingCurso(false); }
  };

  const handleUpdateCurso = async () => {
    if (!editandoCurso?.nombre.trim()) return;
    try {
      const r = await updateCurso(editandoCurso.id, { nombre: editandoCurso.nombre.trim() });
      setCursos(prev => prev.map(c => c.id === editandoCurso.id ? r.data : c));
      setEditandoCurso(null);
      toast(tr('ap_courseUpdated'));
    } catch { toast(tr('ap_errorSave'), 'error'); }
  };

  const handleDeleteCurso = async (curso) => {
    if (!window.confirm(`¿Eliminar "${curso.nombre}"? Se borrarán todos sus módulos.`)) return;
    try {
      await deleteCurso(curso.id);
      setCursos(prev => prev.filter(c => c.id !== curso.id));
      toast(tr('ap_courseDeleted'));
    } catch { toast(tr('ap_errorDelete'), 'error'); }
  };

  const modForm = (id) => nuevoMod[id] || { nombre: '', url_imagen: '', id_profesor: '' };
  const setModForm = (id, v) => setNuevoMod(prev => ({ ...prev, [id]: { ...modForm(id), ...v } }));

  const buildModPayload = (form, cursoId) => ({
    id_curso: cursoId,
    nombre: form.nombre.trim(),
    ...(form.url_imagen?.trim() ? { url_imagen: form.url_imagen.trim() } : {}),
    id_profesor: form.id_profesor ? Number(form.id_profesor) : (isProfesor ? user.id : null),
  });

  const handleCreateModulo = async (cursoId) => {
    const form = modForm(cursoId);
    if (!form.nombre.trim()) return;
    setSavingMod(prev => ({ ...prev, [cursoId]: true }));
    try {
      const r = await createModulo(buildModPayload(form, cursoId));
      setModulos(prev => ({ ...prev, [cursoId]: [...(prev[cursoId] || []), r.data] }));
      setNuevoMod(prev => ({ ...prev, [cursoId]: { nombre: '', url_imagen: '', id_profesor: '' } }));
      setShowModForm(prev => ({ ...prev, [cursoId]: false }));
      toast(tr('ap_moduleCreated'));
    } catch { toast(tr('ap_errorSave'), 'error'); }
    finally { setSavingMod(prev => ({ ...prev, [cursoId]: false })); }
  };

  const handleUpdateModulo = async (cursoId) => {
    if (!editandoMod?.nombre.trim()) return;
    try {
      const payload = {
        nombre: editandoMod.nombre.trim(),
        ...(editandoMod.url_imagen?.trim() ? { url_imagen: editandoMod.url_imagen.trim() } : {}),
        id_profesor: editandoMod.id_profesor ? Number(editandoMod.id_profesor) : null,
      };
      const r = await updateModulo(editandoMod.id, payload);
      setModulos(prev => ({ ...prev, [cursoId]: prev[cursoId].map(m => m.id === editandoMod.id ? r.data : m) }));
      setEditandoMod(null);
      toast(tr('ap_moduleUpdated'));
    } catch { toast(tr('ap_errorSave'), 'error'); }
  };

  const handleDeleteModulo = async (cursoId, mod) => {
    if (!window.confirm(`¿Eliminar "${mod.nombre}"?`)) return;
    try {
      await deleteModulo(mod.id);
      setModulos(prev => ({ ...prev, [cursoId]: prev[cursoId].filter(m => m.id !== mod.id) }));
      toast(tr('ap_moduleDeleted'));
    } catch { toast(tr('ap_errorDelete'), 'error'); }
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="ap-layout">
      <aside className="ap-sidebar">
        <div className="ap-sidebar-title">{isAdmin ? tr('nav_adminPanel') : tr('ap_profesorPanel')}</div>
        <nav className="ap-nav">
          {isAdmin && (
            <button className={`ap-nav-item ${activa === 'usuarios' ? 'ap-nav-active' : ''}`} onClick={() => setActiva('usuarios')}>
              <span className="ap-nav-icon">👤</span> {tr('ap_users')}
            </button>
          )}
          <button className={`ap-nav-item ${activa === 'cursos' ? 'ap-nav-active' : ''}`} onClick={() => setActiva('cursos')}>
            <span className="ap-nav-icon">📚</span> {tr('ap_courses')}
          </button>
          {isAdmin && (
            <button className={`ap-nav-item ${activa === 'notificaciones' ? 'ap-nav-active' : ''}`} onClick={() => setActiva('notificaciones')}>
              <span className="ap-nav-icon">🔔</span> Notificaciones
            </button>
          )}
        </nav>
      </aside>

      <main className="ap-content">

        {/* ══════════ USUARIOS ══════════ */}
        {activa === 'usuarios' && isAdmin && (
          <div>
            <h2 className="ap-section-h">{tr('ap_users')}</h2>
            <div className="ap-filter-row">
              <input className="ap-filter-input" placeholder={tr('ap_searchUser')} value={filtro} onChange={e => setFiltro(e.target.value)} />
              <span className="ap-count">{usuariosFiltrados.length} / {usuarios.length}</span>
            </div>

            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>{tr('ap_colUser')}</th>
                    <th>{tr('ap_colName')}</th>
                    <th>{tr('ap_colEmail')}</th>
                    <th>{tr('ap_colCurrentRole')}</th>
                    <th>{tr('ap_colChangeRole')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map(u => (
                    <React.Fragment key={u.id}>
                      <tr className={`ap-tr ${expandedId === u.id ? 'ap-tr-open' : ''}`}>
                        <td className="ap-td-expand" onClick={() => toggleExpand(u)}>
                          {expandedId === u.id ? '▾' : '▸'}
                        </td>
                        <td className="ap-td-bold" onClick={() => toggleExpand(u)} style={{ cursor: 'pointer' }}>{u.nombre_usuario}</td>
                        <td>{u.nombre ? `${u.nombre} ${u.apellidos || ''}`.trim() : '—'}</td>
                        <td className="ap-td-muted">{u.correo_electronico}</td>
                        <td><span className="ap-rol-badge">{Array.isArray(u.roles) ? u.roles.join(', ') : '—'}</span></td>
                        <td>
                          <div className="ap-rol-row">
                            <select className="ap-select" value={rolesEdit[u.id] || 'alumno'} onChange={e => setRolesEdit(prev => ({ ...prev, [u.id]: e.target.value }))}>
                              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <button className="ap-btn ap-btn-save" onClick={() => handleChangeRol(u.id)} disabled={savingRol[u.id]}>
                              {savingRol[u.id] ? '...' : tr('save')}
                            </button>
                          </div>
                        </td>
                        <td>
                          <button className="ap-btn ap-btn-delete" onClick={() => handleDeleteUser(u)} disabled={u.id === user.id}>{tr('delete')}</button>
                        </td>
                      </tr>

                      {expandedId === u.id && (
                        <tr key={`exp-${u.id}`}>
                          <td colSpan={7} className="ap-expand-cell">
                            {loadingExpand ? <p className="ap-loading">{tr('loading')}</p> : (
                              <>
                                <div className="ap-user-tabs">
                                  <button className={`ap-user-tab ${userTab === 'perfil' ? 'active' : ''}`} onClick={() => setUserTab('perfil')}>{tr('ap_tabProfile')}</button>
                                  <button className={`ap-user-tab ${userTab === 'modulos' ? 'active' : ''}`} onClick={() => openModulosTab(u.id)}>{tr('ap_tabEnrollments')}</button>
                                </div>

                                {/* ── TAB PERFIL ── */}
                                {userTab === 'perfil' && (
                                  <div className="ap-user-form">
                                    <div className="ap-form-row">
                                      <div className="ap-form-field">
                                        <label>{tr('r_name')}</label>
                                        <input className="ap-input ap-input-sm" value={editForm.nombre} onChange={e => setEditForm(p => ({ ...p, nombre: e.target.value }))} />
                                      </div>
                                      <div className="ap-form-field">
                                        <label>{tr('ep_surnameLabel')}</label>
                                        <input className="ap-input ap-input-sm" value={editForm.apellidos} onChange={e => setEditForm(p => ({ ...p, apellidos: e.target.value }))} />
                                      </div>
                                      <div className="ap-form-field">
                                        <label>{tr('r_city')}</label>
                                        <input className="ap-input ap-input-sm" value={editForm.ciudad} onChange={e => setEditForm(p => ({ ...p, ciudad: e.target.value }))} />
                                      </div>
                                      <div className="ap-form-field">
                                        <label>{tr('r_country')}</label>
                                        <input className="ap-input ap-input-sm" value={editForm.pais} onChange={e => setEditForm(p => ({ ...p, pais: e.target.value }))} />
                                      </div>
                                    </div>
                                    <button className="ap-btn ap-btn-save" onClick={() => handleSaveEdit(u.id)} disabled={savingEdit}>
                                      {savingEdit ? tr('saving') : tr('ae_saveChanges')}
                                    </button>
                                  </div>
                                )}

                                {/* ── TAB MATRÍCULAS ── */}
                                {userTab === 'modulos' && (
                                  <div className="ap-user-modulos">
                                    {userModulos === null ? (
                                      <p className="ap-loading">{tr('loading')}</p>
                                    ) : userModulos.length === 0 ? (
                                      <p className="ap-empty">{tr('ap_noEnrollments')}</p>
                                    ) : (
                                      <div className="ap-matriculas-list">
                                        {userModulos.map(mod => (
                                          <div key={mod.id} className="ap-matricula-row">
                                            <span className="ap-matricula-nombre">{mod.nombre}</span>
                                            <button className="ap-btn ap-btn-delete" onClick={() => handleUnenroll(u.id, mod)}>{tr('ap_unenroll')}</button>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    <div className="ap-enroll-form">
                                      <span className="ap-enroll-label">{tr('ap_enrollIn')}</span>
                                      <select
                                        className="ap-select ap-select-sm"
                                        value={enrollCursoId}
                                        onChange={e => { setEnrollCursoId(e.target.value); setEnrollModuloId(''); if (e.target.value) loadModulos(Number(e.target.value)); }}
                                      >
                                        <option value="">{tr('ap_selectCourse')}</option>
                                        {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                      </select>
                                      <select className="ap-select ap-select-sm" value={enrollModuloId} onChange={e => setEnrollModuloId(e.target.value)} disabled={!enrollCursoId}>
                                        <option value="">{tr('ap_selectModule')}</option>
                                        {modulosDisponibles.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                                      </select>
                                      <button className="ap-btn ap-btn-save" onClick={() => handleEnroll(u.id)} disabled={!enrollModuloId || enrolling}>
                                        {enrolling ? '...' : tr('ap_enroll')}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════ CURSOS ══════════ */}
        {activa === 'cursos' && (
          <div>
            <h2 className="ap-section-h">{tr('ap_courses')}</h2>
            {isAdmin && (
              <div className="ap-new-row">
                <input className="ap-input" placeholder={tr('ap_newCoursePlaceholder')} value={nuevoCursoNombre} onChange={e => setNuevoCursoNombre(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateCurso()} />
                <button className="ap-btn ap-btn-save" onClick={handleCreateCurso} disabled={savingCurso || !nuevoCursoNombre.trim()}>{tr('ap_createCourse')}</button>
              </div>
            )}

            {loadingCursos ? <p className="ap-loading">{tr('loading')}</p> : cursos.length === 0 ? (
              <p className="ap-empty">{tr('ap_noCourses')}</p>
            ) : (
              <div className="ap-cursos-list">
                {cursos.map(curso => {
                  const expanded    = expandidosCurso.has(curso.id);
                  const mods        = modulos[curso.id];
                  const editingThis = editandoCurso?.id === curso.id;
                  return (
                    <div key={curso.id} className="ap-curso-card">
                      <div className="ap-curso-header">
                        {editingThis ? (
                          <div className="ap-inline-edit">
                            <input className="ap-input" value={editandoCurso.nombre} onChange={e => setEditandoCurso(p => ({ ...p, nombre: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') handleUpdateCurso(); if (e.key === 'Escape') setEditandoCurso(null); }} autoFocus />
                            <button className="ap-btn ap-btn-save" onClick={handleUpdateCurso}>{tr('save')}</button>
                            <button className="ap-btn ap-btn-cancel" onClick={() => setEditandoCurso(null)}>{tr('cancel')}</button>
                          </div>
                        ) : (
                          <button className="ap-curso-nombre" onClick={() => toggleExpandCurso(curso.id)}>
                            <span className="ap-expand-icon">{expanded ? '▾' : '▸'}</span>
                            {curso.nombre}
                          </button>
                        )}
                        {!editingThis && (
                          <div className="ap-curso-actions">
                            <button className="ap-btn ap-btn-edit" onClick={() => setEditandoCurso({ id: curso.id, nombre: curso.nombre })}>{tr('edit')}</button>
                            {isAdmin && <button className="ap-btn ap-btn-delete" onClick={() => handleDeleteCurso(curso)}>{tr('delete')}</button>}
                          </div>
                        )}
                      </div>

                      {expanded && (
                        <div className="ap-modulos">
                          {!mods ? <p className="ap-loading">{tr('loading')}</p> : (
                            <>
                              {mods.map(mod => {
                                const editingMod = editandoMod?.id === mod.id;
                                return (
                                  <div key={mod.id} className="ap-modulo-row">
                                    {editingMod ? (
                                      <div className="ap-mod-form">
                                        <input className="ap-input ap-input-sm" placeholder={tr('ap_moduleNamePlaceholder')} value={editandoMod.nombre} onChange={e => setEditandoMod(p => ({ ...p, nombre: e.target.value }))} />
                                        <input className="ap-input ap-input-sm" placeholder={tr('ap_moduleImagePlaceholder')} value={editandoMod.url_imagen || ''} onChange={e => setEditandoMod(p => ({ ...p, url_imagen: e.target.value }))} />
                                        {isAdmin && (
                                          <select className="ap-select ap-select-sm" value={editandoMod.id_profesor || ''} onChange={e => setEditandoMod(p => ({ ...p, id_profesor: e.target.value }))}>
                                            <option value="">{tr('cp_no_profesor')}</option>
                                            {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre_usuario}</option>)}
                                          </select>
                                        )}
                                        <div className="ap-mod-form-btns">
                                          <button className="ap-btn ap-btn-save" onClick={() => handleUpdateModulo(curso.id)}>{tr('save')}</button>
                                          <button className="ap-btn ap-btn-cancel" onClick={() => setEditandoMod(null)}>{tr('cancel')}</button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="ap-modulo-content">
                                        <div className="ap-modulo-main">
                                          <span className="ap-modulo-nombre">{mod.nombre}</span>
                                          <div className="ap-modulo-actions">
                                            {canManageMod(mod) && (
                                              <button
                                                className={`ap-btn ${expandedModMat === mod.id ? 'ap-btn-save' : 'ap-btn-edit'}`}
                                                onClick={() => toggleModMat(mod)}
                                              >
                                                {tr('ap_tabEnrollments')}
                                              </button>
                                            )}
                                            {canManageMod(mod) && <button className="ap-btn ap-btn-edit" onClick={() => setEditandoMod({ id: mod.id, nombre: mod.nombre, url_imagen: mod.url_imagen || '', id_profesor: mod.id_profesor || '' })}>{tr('edit')}</button>}
                                            {isAdmin && <button className="ap-btn ap-btn-delete" onClick={() => handleDeleteModulo(curso.id, mod)}>{tr('delete')}</button>}
                                          </div>
                                        </div>

                                        {expandedModMat === mod.id && (
                                          <div className="ap-mat-panel">
                                            <div className="ap-mat-list">
                                              {!modMatriculas[mod.id] ? (
                                                <p className="ap-loading">{tr('loading')}</p>
                                              ) : modMatriculas[mod.id].length === 0 ? (
                                                <p className="ap-empty">{tr('ap_noStudents')}</p>
                                              ) : (
                                                modMatriculas[mod.id].map(u => (
                                                  <div key={u.id} className="ap-mat-row">
                                                    <span className="ap-mat-name">{u.nombre_usuario}{u.nombre ? ` — ${u.nombre} ${u.apellidos || ''}` : ''}</span>
                                                    <button className="ap-btn ap-btn-delete" onClick={() => handleModUnenroll(mod.id, u.id)}>{tr('ap_removeStudent')}</button>
                                                  </div>
                                                ))
                                              )}
                                            </div>

                                            <div className="ap-mat-search-row">
                                              <input
                                                className="ap-input ap-input-sm"
                                                placeholder={tr('ap_searchUser')}
                                                value={matSearch}
                                                onChange={e => handleMatSearch(e.target.value)}
                                              />
                                              {matSearchLoading && <span className="ap-mat-hint">{tr('ap_searching')}</span>}
                                            </div>
                                            {matSearchResults.length > 0 && (
                                              <div className="ap-mat-results">
                                                {matSearchResults
                                                  .filter(u => !modMatriculas[mod.id]?.some(m => m.id === u.id))
                                                  .map(u => (
                                                    <button
                                                      key={u.id}
                                                      className="ap-mat-result-row"
                                                      onClick={() => handleModEnroll(mod.id, u.id)}
                                                      disabled={matEnrolling}
                                                    >
                                                      <span>{u.nombre_usuario}</span>
                                                      {u.nombre && <span className="ap-mat-hint">{u.nombre} {u.apellidos || ''}</span>}
                                                      <span className="ap-mat-add">{tr('ap_addStudent')}</span>
                                                    </button>
                                                  ))
                                                }
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                              {showModForm[curso.id] ? (
                                <div className="ap-mod-form ap-mod-new-form">
                                  <input className="ap-input ap-input-sm" placeholder={tr('ap_moduleNamePlaceholder')} value={modForm(curso.id).nombre} onChange={e => setModForm(curso.id, { nombre: e.target.value })} />
                                  <input className="ap-input ap-input-sm" placeholder={tr('ap_moduleImagePlaceholder')} value={modForm(curso.id).url_imagen} onChange={e => setModForm(curso.id, { url_imagen: e.target.value })} />
                                  {isAdmin && (
                                    <select className="ap-select ap-select-sm" value={modForm(curso.id).id_profesor} onChange={e => setModForm(curso.id, { id_profesor: e.target.value })}>
                                      <option value="">{tr('cp_no_profesor')}</option>
                                      {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre_usuario}</option>)}
                                    </select>
                                  )}
                                  <div className="ap-mod-form-btns">
                                    <button className="ap-btn ap-btn-save" onClick={() => handleCreateModulo(curso.id)} disabled={savingMod[curso.id]}>
                                      {savingMod[curso.id] ? '...' : tr('ap_createModule')}
                                    </button>
                                    <button className="ap-btn ap-btn-cancel" onClick={() => setShowModForm(prev => ({ ...prev, [curso.id]: false }))}>{tr('cancel')}</button>
                                  </div>
                                </div>
                              ) : (
                                <button className="ap-btn-add-mod" onClick={() => setShowModForm(prev => ({ ...prev, [curso.id]: true }))}>{tr('ap_addModule')}</button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════ NOTIFICACIONES ══════════ */}
        {activa === 'notificaciones' && isAdmin && (
          <div>
            <h2 className="ap-section-h">Notificaciones</h2>
            <p className="ap-empty" style={{ marginBottom: '20px' }}>Lanza manualmente los boletines de notificación para todos los usuarios.</p>
            <div className="ap-notif-actions">
              <div className="ap-notif-card">
                <h4>Boletín diario</h4>
                <p>Envía el resumen diario de actividad a todos los usuarios con notificaciones activas.</p>
                <button className="ap-btn ap-btn-save" onClick={handleBoletinDiario} disabled={sendingDiario}>
                  {sendingDiario ? 'Enviando...' : 'Lanzar boletín diario'}
                </button>
              </div>
              <div className="ap-notif-card">
                <h4>Boletín semanal</h4>
                <p>Envía el resumen semanal de actividad a todos los usuarios con notificaciones activas.</p>
                <button className="ap-btn ap-btn-save" onClick={handleBoletinSemanal} disabled={sendingSemanal}>
                  {sendingSemanal ? 'Enviando...' : 'Lanzar boletín semanal'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminPanel;
