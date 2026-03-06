import { useState } from 'react';

const BASE_URL = '/api';
const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY;

function Debug() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [endpoint, setEndpoint] = useState('');

  async function test(url, label) {
    setLoading(true);
    setEndpoint(label);
    try {
      const res = await fetch(url, { headers: { 'X-Auth-Token': API_KEY } });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().split('T')[0];

  const tests = [
    { label: 'Últimos partidos La Liga', url: `${BASE_URL}/competitions/PD/matches?status=FINISHED&limit=5` },
    { label: 'Partidos hoy (todas)', url: `${BASE_URL}/matches?date=${today}` },
    { label: 'Próximos Premier', url: `${BASE_URL}/competitions/PL/matches?status=SCHEDULED` },
    { label: 'Estado API Key', url: `${BASE_URL}/competitions` },
  ];

  return (
    <div style={{ padding: 24, color: '#fff' }}>
      <h2 style={{ marginBottom: 16 }}>🔧 Debug football-data.org</h2>
      <p style={{ marginBottom: 16 }}>
        API Key: <code style={{ color: '#e94560' }}>{API_KEY ? API_KEY.slice(0, 8) + '...' : '❌ NO DETECTADA'}</code>
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {tests.map(t => (
          <button key={t.label} onClick={() => test(t.url, t.label)} style={{
            padding: '8px 14px', background: '#e94560', color: '#fff',
            border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: '#aaa' }}>Cargando {endpoint}...</p>}

      {result && (
        <>
          <h3 style={{ color: '#aaa', marginBottom: 8 }}>{endpoint}</h3>
          <pre style={{
            background: '#1a1a2e', padding: 16, borderRadius: 8,
            fontSize: 12, overflow: 'auto', maxHeight: 500
          }}>
            {JSON.stringify(
              result.matches ? { total: result.matches.length, first2: result.matches.slice(0, 2) } : result,
              null, 2
            )}
          </pre>
        </>
      )}
    </div>
  );
}

export default Debug;
