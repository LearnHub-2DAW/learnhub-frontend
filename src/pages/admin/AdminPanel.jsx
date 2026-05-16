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
import './AdminPanel.css';

const ROLES = ['admin', 'profesor', 'alumno'];

const AdminPanel = () => {
  const { user } = useAuth();
  const { tr } = useLang();
  const toast = useToast();

  const isAdmin    = user?.roles?.includes('admin');
  const isProfesor = user?.roles?.includes('profesor');
  if (!isAdmin && !isProfesor) return <Navigate to="/dashboard" replace />;

  const secciones = isAdmin ? ['usuarios', 'cursos'] : ['cursos'];
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
      .catch(() => toast('Error al cargar usuarios', 'error'));
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
      toast('Perfil actualizado');
    } catch {
      toast('Error al actualizar perfil', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleChangeRol = async (id) => {
    setSavingRol(prev => ({ ...prev, [id]: true }));
    try {
      await changeRolUsuario(id, rolesEdit[id]);
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, roles: [rolesEdit[id]] } : u));
      toast('Rol actualizado');
    } catch {
      toast('Error al cambiar rol', 'error');
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
      toast('Usuario eliminado');
    } catch {
      toast('Error al eliminar usuario', 'error');
    }
  };

  const handleUnenroll = async (userId, mod) => {
    try {
      await unenrollUsuario(mod.id, userId);
      setUserModulos(prev => prev.filter(m => m.id !== mod.id));
      toast(`Desmatriculado de ${mod.nombre}`);
    } catch {
      toast('Error al desmatricular', 'error');
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
      toast('Matriculado correctamente');
    } catch (e) {
      toast(e.response?.data?.error || 'Error al matricular', 'error');
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
      toast('Matriculado correctamente');
    } catch (e) {
      toast(e.response?.data?.error || 'Error al matricular', 'error');
    } finally {
      setMatEnrolling(false);
    }
  };

  const handleModUnenroll = async (modId, userId) => {
    try {
      await unenrollUsuario(modId, userId);
      setModMatriculas(prev => ({ ...prev, [modId]: prev[modId].filter(u => u.id !== userId) }));
      toast('Desmatriculado');
    } catch {
      toast('Error al desmatricular', 'error');
    }
  };

  useEffect(() => {
    if (activa !== 'cursos') return;
    setLoadingCursos(true);
    getCursos().then(r => setCursos(r.data)).catch(() => toast('Error al cargar cursos', 'error')).finally(() => setLoadingCursos(false));
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
      toast('Curso creado');
    } catch { toast('Error al crear curso', 'error'); }
    finally { setSavingCurso(false); }
  };

  const handleUpdateCurso = async () => {
    if (!editandoCurso?.nombre.trim()) return;
    try {
      const r = await updateCurso(editandoCurso.id, { nombre: editandoCurso.nombre.trim() });
      setCursos(prev => prev.map(c => c.id === editandoCurso.id ? r.data : c));
      setEditandoCurso(null);
      toast('Curso actualizado');
    } catch { toast('Error al actualizar curso', 'error'); }
  };

  const handleDeleteCurso = async (curso) => {
    if (!window.confirm(`¿Eliminar "${curso.nombre}"? Se borrarán todos sus módulos.`)) return;
    try {
      await deleteCurso(curso.id);
      setCursos(prev => prev.filter(c => c.id !== curso.id));
      toast('Curso eliminado');
    } catch { toast('Error al eliminar curso', 'error'); }
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
      toast('Módulo creado');
    } catch { toast('Error al crear módulo', 'error'); }
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
      toast('Módulo actualizado');
    } catch { toast('Error al actualizar módulo', 'error'); }
  };

  const handleDeleteModulo = async (cursoId, mod) => {
    if (!window.confirm(`¿Eliminar "${mod.nombre}"?`)) return;
    try {
      await deleteModulo(mod.id);
      setModulos(prev => ({ ...prev, [cursoId]: prev[cursoId].filter(m => m.id !== mod.id) }));
      toast('Módulo eliminado');
    } catch { toast('Error al eliminar módulo', 'error'); }
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="ap-layout">
      <aside className="ap-sidebar">
        <div className="ap-sidebar-title">{isAdmin ? tr('nav_adminPanel') : 'Panel Profesor'}</div>
        <nav className="ap-nav">
          {isAdmin && (
            <button className={`ap-nav-item ${activa === 'usuarios' ? 'ap-nav-active' : ''}`} onClick={() => setActiva('usuarios')}>
              <span className="ap-nav-icon">👤</span> Usuarios
            </button>
          )}
          <button className={`ap-nav-item ${activa === 'cursos' ? 'ap-nav-active' : ''}`} onClick={() => setActiva('cursos')}>
            <span className="ap-nav-icon">📚</span> Cursos
          </button>
        </nav>
      </aside>

      <main className="ap-content">

        {/* ══════════ USUARIOS ══════════ */}
        {activa === 'usuarios' && isAdmin && (
          <div>
            <h2 className="ap-section-h">Usuarios</h2>
            <div className="ap-filter-row">
              <input className="ap-filter-input" placeholder="Buscar usuario..." value={filtro} onChange={e => setFiltro(e.target.value)} />
              <span className="ap-count">{usuariosFiltrados.length} / {usuarios.length}</span>
            </div>

            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Usuario</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol actual</th>
                    <th>Cambiar rol</th>
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
                              {savingRol[u.id] ? '...' : 'Guardar'}
                            </button>
                          </div>
                        </td>
                        <td>
                          <button className="ap-btn ap-btn-delete" onClick={() => handleDeleteUser(u)} disabled={u.id === user.id}>Eliminar</button>
                        </td>
                      </tr>

                      {expandedId === u.id && (
                        <tr key={`exp-${u.id}`}>
                          <td colSpan={7} className="ap-expand-cell">
                            {loadingExpand ? <p className="ap-loading">Cargando...</p> : (
                              <>
                                <div className="ap-user-tabs">
                                  <button className={`ap-user-tab ${userTab === 'perfil' ? 'active' : ''}`} onClick={() => setUserTab('perfil')}>Perfil</button>
                                  <button className={`ap-user-tab ${userTab === 'modulos' ? 'active' : ''}`} onClick={() => openModulosTab(u.id)}>Matrículas</button>
                                </div>

                                {/* ── TAB PERFIL ── */}
                                {userTab === 'perfil' && (
                                  <div className="ap-user-form">
                                    <div className="ap-form-row">
                                      <div className="ap-form-field">
                                        <label>Nombre</label>
                                        <input className="ap-input ap-input-sm" value={editForm.nombre} onChange={e => setEditForm(p => ({ ...p, nombre: e.target.value }))} />
                                      </div>
                                      <div className="ap-form-field">
                                        <label>Apellidos</label>
                                        <input className="ap-input ap-input-sm" value={editForm.apellidos} onChange={e => setEditForm(p => ({ ...p, apellidos: e.target.value }))} />
                                      </div>
                                      <div className="ap-form-field">
                                        <label>Ciudad</label>
                                        <input className="ap-input ap-input-sm" value={editForm.ciudad} onChange={e => setEditForm(p => ({ ...p, ciudad: e.target.value }))} />
                                      </div>
                                      <div className="ap-form-field">
                                        <label>País</label>
                                        <input className="ap-input ap-input-sm" value={editForm.pais} onChange={e => setEditForm(p => ({ ...p, pais: e.target.value }))} />
                                      </div>
                                    </div>
                                    <button className="ap-btn ap-btn-save" onClick={() => handleSaveEdit(u.id)} disabled={savingEdit}>
                                      {savingEdit ? 'Guardando...' : 'Guardar cambios'}
                                    </button>
                                  </div>
                                )}

                                {/* ── TAB MATRÍCULAS ── */}
                                {userTab === 'modulos' && (
                                  <div className="ap-user-modulos">
                                    {userModulos === null ? (
                                      <p className="ap-loading">Cargando matrículas...</p>
                                    ) : userModulos.length === 0 ? (
                                      <p className="ap-empty">Sin matrículas.</p>
                                    ) : (
                                      <div className="ap-matriculas-list">
                                        {userModulos.map(mod => (
                                          <div key={mod.id} className="ap-matricula-row">
                                            <span className="ap-matricula-nombre">{mod.nombre}</span>
                                            <button className="ap-btn ap-btn-delete" onClick={() => handleUnenroll(u.id, mod)}>Desmatricular</button>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    <div className="ap-enroll-form">
                                      <span className="ap-enroll-label">Matricular en:</span>
                                      <select
                                        className="ap-select ap-select-sm"
                                        value={enrollCursoId}
                                        onChange={e => { setEnrollCursoId(e.target.value); setEnrollModuloId(''); if (e.target.value) loadModulos(Number(e.target.value)); }}
                                      >
                                        <option value="">Curso...</option>
                                        {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                      </select>
                                      <select className="ap-select ap-select-sm" value={enrollModuloId} onChange={e => setEnrollModuloId(e.target.value)} disabled={!enrollCursoId}>
                                        <option value="">Módulo...</option>
                                        {modulosDisponibles.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                                      </select>
                                      <button className="ap-btn ap-btn-save" onClick={() => handleEnroll(u.id)} disabled={!enrollModuloId || enrolling}>
                                        {enrolling ? '...' : 'Matricular'}
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
            <h2 className="ap-section-h">Cursos</h2>
            <div className="ap-new-row">
              <input className="ap-input" placeholder="Nombre del nuevo curso..." value={nuevoCursoNombre} onChange={e => setNuevoCursoNombre(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateCurso()} />
              <button className="ap-btn ap-btn-save" onClick={handleCreateCurso} disabled={savingCurso || !nuevoCursoNombre.trim()}>+ Crear curso</button>
            </div>

            {loadingCursos ? <p className="ap-loading">Cargando...</p> : cursos.length === 0 ? (
              <p className="ap-empty">No hay cursos.</p>
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
                            <button className="ap-btn ap-btn-save" onClick={handleUpdateCurso}>Guardar</button>
                            <button className="ap-btn ap-btn-cancel" onClick={() => setEditandoCurso(null)}>Cancelar</button>
                          </div>
                        ) : (
                          <button className="ap-curso-nombre" onClick={() => toggleExpandCurso(curso.id)}>
                            <span className="ap-expand-icon">{expanded ? '▾' : '▸'}</span>
                            {curso.nombre}
                          </button>
                        )}
                        {!editingThis && (
                          <div className="ap-curso-actions">
                            <button className="ap-btn ap-btn-edit" onClick={() => setEditandoCurso({ id: curso.id, nombre: curso.nombre })}>Editar</button>
                            {isAdmin && <button className="ap-btn ap-btn-delete" onClick={() => handleDeleteCurso(curso)}>Eliminar</button>}
                          </div>
                        )}
                      </div>

                      {expanded && (
                        <div className="ap-modulos">
                          {!mods ? <p className="ap-loading">Cargando módulos...</p> : (
                            <>
                              {mods.map(mod => {
                                const editingMod = editandoMod?.id === mod.id;
                                return (
                                  <div key={mod.id} className="ap-modulo-row">
                                    {editingMod ? (
                                      <div className="ap-mod-form">
                                        <input className="ap-input ap-input-sm" placeholder="Nombre" value={editandoMod.nombre} onChange={e => setEditandoMod(p => ({ ...p, nombre: e.target.value }))} />
                                        <input className="ap-input ap-input-sm" placeholder="URL imagen (opcional)" value={editandoMod.url_imagen || ''} onChange={e => setEditandoMod(p => ({ ...p, url_imagen: e.target.value }))} />
                                        {isAdmin && (
                                          <select className="ap-select ap-select-sm" value={editandoMod.id_profesor || ''} onChange={e => setEditandoMod(p => ({ ...p, id_profesor: e.target.value }))}>
                                            <option value="">Sin profesor</option>
                                            {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre_usuario}</option>)}
                                          </select>
                                        )}
                                        <div className="ap-mod-form-btns">
                                          <button className="ap-btn ap-btn-save" onClick={() => handleUpdateModulo(curso.id)}>Guardar</button>
                                          <button className="ap-btn ap-btn-cancel" onClick={() => setEditandoMod(null)}>Cancelar</button>
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
                                                Matrículas
                                              </button>
                                            )}
                                            {canManageMod(mod) && <button className="ap-btn ap-btn-edit" onClick={() => setEditandoMod({ id: mod.id, nombre: mod.nombre, url_imagen: mod.url_imagen || '', id_profesor: mod.id_profesor || '' })}>Editar</button>}
                                            {isAdmin && <button className="ap-btn ap-btn-delete" onClick={() => handleDeleteModulo(curso.id, mod)}>Eliminar</button>}
                                          </div>
                                        </div>

                                        {expandedModMat === mod.id && (
                                          <div className="ap-mat-panel">
                                            <div className="ap-mat-list">
                                              {!modMatriculas[mod.id] ? (
                                                <p className="ap-loading">Cargando...</p>
                                              ) : modMatriculas[mod.id].length === 0 ? (
                                                <p className="ap-empty">Sin alumnos matriculados.</p>
                                              ) : (
                                                modMatriculas[mod.id].map(u => (
                                                  <div key={u.id} className="ap-mat-row">
                                                    <span className="ap-mat-name">{u.nombre_usuario}{u.nombre ? ` — ${u.nombre} ${u.apellidos || ''}` : ''}</span>
                                                    <button className="ap-btn ap-btn-delete" onClick={() => handleModUnenroll(mod.id, u.id)}>Quitar</button>
                                                  </div>
                                                ))
                                              )}
                                            </div>

                                            <div className="ap-mat-search-row">
                                              <input
                                                className="ap-input ap-input-sm"
                                                placeholder="Buscar alumno para matricular..."
                                                value={matSearch}
                                                onChange={e => handleMatSearch(e.target.value)}
                                              />
                                              {matSearchLoading && <span className="ap-mat-hint">Buscando...</span>}
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
                                                      <span className="ap-mat-add">+ Matricular</span>
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
                                  <input className="ap-input ap-input-sm" placeholder="Nombre del módulo" value={modForm(curso.id).nombre} onChange={e => setModForm(curso.id, { nombre: e.target.value })} />
                                  <input className="ap-input ap-input-sm" placeholder="URL imagen (opcional)" value={modForm(curso.id).url_imagen} onChange={e => setModForm(curso.id, { url_imagen: e.target.value })} />
                                  {isAdmin && (
                                    <select className="ap-select ap-select-sm" value={modForm(curso.id).id_profesor} onChange={e => setModForm(curso.id, { id_profesor: e.target.value })}>
                                      <option value="">Sin profesor</option>
                                      {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre_usuario}</option>)}
                                    </select>
                                  )}
                                  <div className="ap-mod-form-btns">
                                    <button className="ap-btn ap-btn-save" onClick={() => handleCreateModulo(curso.id)} disabled={savingMod[curso.id]}>
                                      {savingMod[curso.id] ? '...' : 'Crear módulo'}
                                    </button>
                                    <button className="ap-btn ap-btn-cancel" onClick={() => setShowModForm(prev => ({ ...prev, [curso.id]: false }))}>Cancelar</button>
                                  </div>
                                </div>
                              ) : (
                                <button className="ap-btn-add-mod" onClick={() => setShowModForm(prev => ({ ...prev, [curso.id]: true }))}>+ Añadir módulo</button>
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

      </main>
    </div>
  );
};

export default AdminPanel;
