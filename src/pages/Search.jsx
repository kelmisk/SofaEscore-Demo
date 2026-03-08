import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchTeams, getAllTeams, teamsReady } from '../services/api';

function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preloading, setPreloading] = useState(false);
  const [ready, setReady] = useState(teamsReady());
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!teamsReady()) {
      setPreloading(true);
      getAllTeams().then(() => { setReady(true); setPreloading(false); });
    }
  }, []);

  useEffect(() => {
    if (!ready || query.trim().length < 2) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try { setResults(await searchTeams(query.trim())); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, ready]);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h1 style={{ color: '#f0f4ff', marginBottom: 20, fontSize: 20, fontWeight: '700' }}>🔍 Buscar equipo</h1>

      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={preloading ? 'Cargando equipos...' : 'Escribe el nombre de un equipo...'}
        disabled={preloading}
        style={{
          width: '100%', padding: '12px 16px', fontSize: 15,
          background: '#0d1526', border: '1px solid #1a2540',
          borderRadius: 10, color: preloading ? '#5a6a8a' : '#f0f4ff',
          outline: 'none', boxSizing: 'border-box',
          cursor: preloading ? 'wait' : 'text',
        }}
      />

      {preloading && (
        <div style={{ marginTop: 16, background: '#0d1526', borderRadius: 10, padding: 16, border: '1px solid #1a2540' }}>
          <p style={{ color: '#f5c518', marginBottom: 4 }}>⏳ Cargando equipos de las 5 ligas...</p>
          <p style={{ color: '#5a6a8a', fontSize: 12 }}>Solo ocurre la primera vez, luego es instantáneo.</p>
        </div>
      )}

      {ready && loading && <p style={{ color: '#8899bb', marginTop: 12 }}>Buscando...</p>}
      {ready && !loading && query.length >= 2 && results.length === 0 && (
        <p style={{ color: '#5a6a8a', marginTop: 12 }}>No se encontraron equipos.</p>
      )}

      <div style={{ marginTop: 16 }}>
        {results.map(team => (
          <div key={team.id} onClick={() => navigate(`/equipo/${team.id}`)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', marginBottom: 8,
              background: '#0d1526', borderRadius: 10, cursor: 'pointer',
              border: '1px solid #1a2540', transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1a2540'}
            onMouseLeave={e => e.currentTarget.style.background = '#0d1526'}
          >
            {team.crest
              ? <img src={team.crest} alt={team.name} style={{ width: 36, height: 36, objectFit: 'contain' }} />
              : <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#1a2540',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#8899bb', fontWeight: 'bold', fontSize: 12, flexShrink: 0,
                }}>{team.name?.slice(0, 2).toUpperCase()}</div>
            }
            <div>
              <div style={{ color: '#f0f4ff', fontWeight: '600' }}>{team.name}</div>
              <div style={{ color: '#5a6a8a', fontSize: 12 }}>{team.leagueFlag} {team.leagueName}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Search;
