import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRecursoById, getModuloById, getCursoById } from '../api/cursos.api';
import { useToast } from '../context/ToastContext';
import { useLang } from '../context/LangContext';
import './AgregarEntrega.css';

const AgregarEntrega = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { tr } = useLang();
  const [recurso, setRecurso] = useState(null);
  const [curso, setCurso] = useState(null);
  const [modulo, setModulo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [archivos, setArchivos] = useState([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

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

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    setArchivos(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  const handleFileInput = (e) => {
    setArchivos(prev => [...prev, ...Array.from(e.target.files)]);
  };

  const removeFile = (idx) => {
    setArchivos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleGuardar = async () => {
    toast('Entrega guardada (funcionalidad pendiente)', 'info');
    navigate(`/recurso/${id}`);
  };

  if (loading) return <div className="page-loading">{tr('loading')}</div>;

  return (
    <div className="agregar-entrega-page">
      <div className="page-card">

        <div className="page-card-header">
          <h1 className="page-title">{curso?.nombre || tr('dt_courseTitle')}</h1>
          <p className="page-breadcrumb">
            <Link to="/dashboard">{tr('home')}</Link>
            <span> / </span>
            {curso && <Link to={`/curso/${curso.id}`}>{curso.nombre}</Link>}
            {modulo && <><span> / </span><span>{modulo.nombre}</span></>}
            {recurso && <><span> / </span><Link to={`/recurso/${id}`}>{recurso.titulo}</Link></>}
            <span> / </span><span>{tr('ae_title')}</span>
          </p>
        </div>

        <div className="entrega-body">
          <h2 className="tarea-titulo">{recurso?.titulo || tr('dt_courseTitle')}</h2>
          <div className="tarea-descripcion">
            {recurso?.contenido || tr('ae_taskDesc')}
          </div>

          <div
            className={`dropzone ${dragging ? 'dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <span className="dropzone-arrow">⬇</span>
            <p>{tr('ae_dropzone')}</p>
            <input
              type="file"
              multiple
              ref={inputRef}
              style={{ display: 'none' }}
              onChange={handleFileInput}
            />
          </div>

          {archivos.length > 0 && (
            <ul className="archivos-lista">
              {archivos.map((f, i) => (
                <li key={i} className="archivo-item">
                  <span>📄 {f.name}</span>
                  <button className="btn-remove-file" onClick={() => removeFile(i)}>✕</button>
                </li>
              ))}
            </ul>
          )}

          <div className="entrega-actions">
            <button className="btn-guardar" onClick={handleGuardar}>{tr('ae_saveChanges')}</button>
            <button className="btn-cancelar" onClick={() => navigate(`/recurso/${id}`)}>{tr('cancel')}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgregarEntrega;
