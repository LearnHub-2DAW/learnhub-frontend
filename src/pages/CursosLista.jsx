import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCursos, getModulosByCurso } from '../api/cursos.api';
import { getMisModulos } from '../api/usuario.api';
import { getFileUrl } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import usePagination from '../hooks/usePagination';
import Pagination from '../components/Pagination';
import '../components/Pagination.css';
import './CursosLista.css';

const modImgUrl = (u) => !u ? null : u.startsWith('http') ? u : getFileUrl(u);

const CursosLista = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tr } = useLang();
  const isStaff = user?.roles?.includes('admin') || user?.roles?.includes('profesor');

  const [cursos, setCursos] = useState([]);
  const [modulosPorCurso, setModulosPorCurso] = useState({});
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    const promises = [
      getCursos(),
      isStaff ? Promise.resolve({ data: [] }) : getMisModulos().catch(() => ({ data: [] })),
    ];
    Promise.all(promises)
      .then(([cursosRes, misModulosRes]) => {
        setCursos(cursosRes.data);
        setEnrolledIds(new Set((misModulosRes.data || []).map(m => m.id)));
        return Promise.all(
          cursosRes.data.map(c =>
            getModulosByCurso(c.id)
              .then(r => ({ cursoId: c.id, modulos: r.data }))
              .catch(() => ({ cursoId: c.id, modulos: [] }))
          )
        );
      })
      .then(grupos => {
        const map = {};
        grupos.forEach(g => { map[g.cursoId] = g.modulos; });
        setModulosPorCurso(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cursosFiltrados = cursos.filter(c =>
    c.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  const { paginated, ...pg } = usePagination(cursosFiltrados);

  if (loading) return <div className="cl-loading">{tr('d_loadingCourses')}</div>;

  return (
    <div className="cl-page">
      <div className="cl-header">
        <h1 className="cl-title">{tr('d_browse_courses')}</h1>
        <input
          type="text"
          className="cl-search"
          placeholder={tr('ap_searchUser')}
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
        />
      </div>

      {cursosFiltrados.length === 0 ? (
        <p className="cl-empty">{tr('d_noCourses')}</p>
      ) : (
        <div className="cl-list">
          {paginated.map(curso => {
            const modulos = modulosPorCurso[curso.id] || [];
            return (
              <div key={curso.id} className="cl-curso-card">
                <div className="cl-curso-header" onClick={() => navigate(`/curso/${curso.id}`)}>
                  <h2 className="cl-curso-nombre">{curso.nombre}</h2>
                  <span className="cl-modulos-count">
                    {modulos.length} {modulos.length !== 1 ? tr('d_modules') : tr('d_module')}
                  </span>
                </div>
                {modulos.length > 0 && (
                  <div className="cl-modulos-grid">
                    {modulos.map(m => {
                      const enrolled = enrolledIds.has(m.id);
                      return (
                        <div
                          key={m.id}
                          className={`cl-modulo-item${enrolled ? ' cl-enrolled' : ''}`}
                          onClick={() => navigate(`/curso/${curso.id}`)}
                        >
                          {m.url_imagen && (
                            <img
                              src={modImgUrl(m.url_imagen)}
                              alt={m.nombre}
                              className="cl-modulo-img"
                              onError={e => { e.target.style.display = 'none'; }}
                            />
                          )}
                          <span className="cl-modulo-nombre">{m.nombre}</span>
                          {enrolled && <span className="cl-enrolled-badge">✓</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          <Pagination {...pg} />
        </div>
      )}
    </div>
  );
};

export default CursosLista;
