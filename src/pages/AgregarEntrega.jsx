import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRecursoById, getModuloById, getCursoById } from '../api/cursos.api';
import { useToast } from '../context/ToastContext';
import './AgregarEntrega.css';

const AgregarEntrega = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
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
    const files = Array.from(e.dataTransfer.files);
    setArchivos(prev => [...prev, ...files]);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    setArchivos(prev => [...prev, ...files]);
  };

  const removeFile = (idx) => {
    setArchivos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleGuardar = async () => {
    toast('Entrega guardada (funcionalidad pendiente)', 'info');
    navigate(`/recurso/${id}`);
  };

  if (loading) return <div className="page-loading">Cargando...</div>;

  return (
    <div className="agregar-entrega-page">
      <div className="page-card">

        {/* Cabecera curso */}
        <div className="page-card-header">
          <h1 className="page-title">{curso?.nombre || 'Título Del Curso'}</h1>
          <p className="page-breadcrumb">
            <Link to="/dashboard">Inicio</Link>
            <span> / </span>
            {curso && <Link to={`/curso/${curso.id}`}>{curso.nombre}</Link>}
            {modulo && <><span> / </span><span>{modulo.nombre}</span></>}
            {recurso && <><span> / </span><Link to={`/recurso/${id}`}>{recurso.titulo}</Link></>}
            <span> / </span><span>Agregar Entrega</span>
          </p>
        </div>

        <div className="entrega-body">
          {/* Nombre y descripción */}
          <h2 className="tarea-titulo">{recurso?.titulo || 'Nombre de la Tarea'}</h2>
          <div className="tarea-descripcion">
            {recurso?.contenido || 'Ficheros o descripción de la Tarea'}
          </div>

          {/* Zona de carga de archivos */}
          <div
            className={`dropzone ${dragging ? 'dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <span className="dropzone-arrow">⬇</span>
            <p>Puedes arrastrar y soltar archivos aquí para añadirlos</p>
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

          {/* Acciones */}
          <div className="entrega-actions">
            <button className="btn-guardar" onClick={handleGuardar}>GUARDAR CAMBIOS</button>
            <button className="btn-cancelar" onClick={() => navigate(`/recurso/${id}`)}>CANCELAR</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgregarEntrega;
