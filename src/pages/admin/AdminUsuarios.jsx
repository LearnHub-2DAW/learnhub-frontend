import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLang } from '../../context/LangContext';
import { getUsuarios, deleteUsuarioAdmin, changeRolUsuario } from '../../api/usuario.api';
import './AdminUsuarios.css';

const ROLES = ['admin', 'profesor', 'alumno'];

const AdminUsuarios = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { tr } = useLang();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rolesEdit, setRolesEdit] = useState({});
  const [savingRol, setSavingRol] = useState({});
  const [filtro, setFiltro] = useState('');

  const isAdmin = user?.roles?.includes('admin');

  useEffect(() => {
    if (!isAdmin) return;
    getUsuarios()
      .then(res => {
        setUsuarios(res.data);
        const initRoles = {};
        res.data.forEach(u => { initRoles[u.id] = u.roles?.[0] || 'alumno'; });
        setRolesEdit(initRoles);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const handleChangeRol = async (id) => {
    setSavingRol(prev => ({ ...prev, [id]: true }));
    try {
      await changeRolUsuario(id, rolesEdit[id]);
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, roles: [rolesEdit[id]] } : u));
      toast(tr('admin_roleUpdated'));
    } catch (err) {
      toast(err.response?.data?.message || 'Error', 'error');
    } finally {
      setSavingRol(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(tr('admin_confirmDelete'))) return;
    try {
      await deleteUsuarioAdmin(u.id);
      setUsuarios(prev => prev.filter(x => x.id !== u.id));
      toast(tr('admin_userDeleted'));
    } catch (err) {
      toast(err.response?.data?.message || 'Error', 'error');
    }
  };

  const usuariosFiltrados = usuarios.filter(u => {
    const texto = `${u.nombre_usuario} ${u.nombre || ''} ${u.apellidos || ''} ${u.correo_electronico}`.toLowerCase();
    return texto.includes(filtro.toLowerCase());
  });

  if (loading) return <div className="page-loading">{tr('admin_loading')}</div>;

  return (
    <div className="admin-page">
      <div className="page-card">

        <div className="page-card-header">
          <h1 className="page-title">{tr('admin_title')}</h1>
          <p className="page-breadcrumb">
            <Link to="/dashboard">{tr('home')}</Link>
            <span> / </span>
            <span>{tr('admin_title')}</span>
          </p>
        </div>

        <div className="admin-body">
          <div className="admin-filter-row">
            <input
              type="text"
              className="admin-filter-input"
              placeholder={tr('pt_filterPlaceholder')}
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
            />
            <span className="admin-count">{usuariosFiltrados.length} / {usuarios.length}</span>
          </div>

          {usuariosFiltrados.length === 0 ? (
            <p className="no-data-msg">{tr('admin_noUsers')}</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{tr('r_username')}</th>
                  <th>{tr('r_name')}</th>
                  <th>{tr('ep_emailAddr')}</th>
                  <th>{tr('pt_colRoles')}</th>
                  <th>{tr('admin_changeRole')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map(u => (
                  <tr key={u.id}>
                    <td className="td-username">{u.nombre_usuario}</td>
                    <td>{u.nombre ? `${u.nombre} ${u.apellidos || ''}`.trim() : '—'}</td>
                    <td className="td-email">{u.correo_electronico}</td>
                    <td>
                      <span className="rol-badge">
                        {Array.isArray(u.roles) ? u.roles.join(', ') : '—'}
                      </span>
                    </td>
                    <td>
                      <div className="rol-change-row">
                        <select
                          className="rol-select"
                          value={rolesEdit[u.id] || 'alumno'}
                          onChange={e => setRolesEdit(prev => ({ ...prev, [u.id]: e.target.value }))}
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <button
                          className="btn-save-rol"
                          onClick={() => handleChangeRol(u.id)}
                          disabled={savingRol[u.id]}
                        >
                          {savingRol[u.id] ? tr('saving') : tr('save')}
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn-delete-user"
                        onClick={() => handleDelete(u)}
                        disabled={u.id === user.id}
                        title={u.id === user.id ? 'No puedes eliminarte a ti mismo' : ''}
                      >
                        {tr('delete')}
                      </button>
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

export default AdminUsuarios;
