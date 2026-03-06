import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchTeams, getAllTeams } from '../services/api';

function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preloading, setPreloading] = useState(false);
  const [ready, setReady] = useState(false);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  function handleSearch(q) {
    clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const teams = await searchTeams(q.trim());
        setResults(teams);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  async function handleInputChange(e) {
    const q = e.target.value;
    setQuery(q);

    // Si los equipos no están cargados aún, cargarlos primero
    if (!ready && q.trim().length >= 2) {
      setPreloading(true);
      try {
        await getAllTeams();
        setReady(true);
        handleSearch(q);
      } finally {
        setPreloading(false);
      }
    } else {
      handleSearch(q);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h1 style={{ color: '#fff', marginBottom: 20 }}>🔍 Buscar equipo</h1>

      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Escribe el nombre de un equipo..."
        style={{
          width: '100%', padding: '12px 16px', fontSize: 16,
          background: '#1a1a2e', border: '1px solid #2a2a3e',
          borderRadius: 10, color: '#fff', outline: 'none',
          boxSizing: 'border-box',
        }}
      />

      {preloading && (
        <div style={{ marginTop: 16, background: '#1a1a2e', borderRadius: 10, padding: 16 }}>
          <p style={{ color: '#e94560', marginBottom: 8 }}>⏳ Cargando equipos de las 5 ligas...</p>
          <p style={{ color: '#666', fontSize: 12 }}>Solo ocurre la primera vez, luego es instantáneo.</p>
        </div>
      )}

      {!preloading && loading && <p style={{ color: '#888', marginTop: 12 }}>Buscando...</p>}

      {!preloading && !loading && query.length >= 2 && results.length === 0 && (
        <p style={{ color: '#888', marginTop: 12 }}>No se encontraron equipos.</p>
      )}

      <div style={{ marginTop: 16 }}>
        {results.map(team => (
          <div
            key={team.id}
            onClick={() => navigate(`/equipo/${team.id}`)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', marginBottom: 8,
              background: '#16213e', borderRadius: 10,
              cursor: 'pointer', border: '1px solid #2a2a3e',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1a1a2e'}
            onMouseLeave={e => e.currentTarget.style.background = '#16213e'}
          >
            {team.crest
              ? <img src={team.crest} alt={team.name} style={{ width: 36, height: 36, objectFit: 'contain' }} />
              : <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#e94560',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 'bold', fontSize: 12, flexShrink: 0,
                }}>
                  {team.name?.slice(0, 2).toUpperCase()}
                </div>
            }
            <div>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>{team.name}</div>
              <div style={{ color: '#888', fontSize: 12 }}>{team.leagueFlag} {team.leagueName}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Search;
