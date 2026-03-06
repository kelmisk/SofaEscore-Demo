import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LEAGUES, getLiveFixtures, getRecentFixtures, getUpcomingFixtures, getFixturesToday } from '../services/api';
import MatchCard from '../components/MatchCard';

const TABS = ['En Vivo', 'Hoy', 'Últimos partidos', 'Próximos partidos'];

function League() {
  const { leagueKey } = useParams();
  const navigate = useNavigate();
  const league = LEAGUES[leagueKey];
  const [tab, setTab] = useState('Últimos partidos');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0); // identificador único por petición

  useEffect(() => {
    setMatches([]);
    setTab('Últimos partidos');
  }, [leagueKey]);

  useEffect(() => {
    if (!league) return;

    const currentId = ++requestId.current; // incrementar en cada efecto

    async function fetchMatches() {
      setLoading(true);
      try {
        let data = [];
        if (tab === 'En Vivo')           data = await getLiveFixtures(league.code);
        if (tab === 'Hoy')               data = await getFixturesToday(league.code);
        if (tab === 'Últimos partidos')  data = await getRecentFixtures(league.code);
        if (tab === 'Próximos partidos') data = await getUpcomingFixtures(league.code);

        // Solo actualizar si esta petición sigue siendo la más reciente
        if (currentId === requestId.current) {
          setMatches(data);
        }
      } catch (err) {
        if (currentId === requestId.current) {
          console.error(err);
          setMatches([]);
        }
      } finally {
        if (currentId === requestId.current) {
          setLoading(false);
        }
      }
    }

    fetchMatches();
  }, [leagueKey, tab]);

  if (!league) return <p style={{ color: '#aaa', padding: 24 }}>Liga no encontrada.</p>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      <h1 style={{ color: '#fff', marginBottom: 16 }}>{league.flag} {league.name}</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: tab === t ? '#e94560' : '#2a2a3e',
            color: tab === t ? '#fff' : '#aaa',
            fontWeight: tab === t ? 'bold' : 'normal',
          }}>
            {t}
          </button>
        ))}
        <button
          onClick={() => navigate(`/liga/${leagueKey}/clasificacion`)}
          style={{
            padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: '#2a2a3e', color: '#aaa',
          }}
        >
          🏆 Clasificación
        </button>
      </div>

      {loading
        ? <p style={{ color: '#aaa' }}>Cargando...</p>
        : matches.length === 0
          ? <p style={{ color: '#888' }}>No hay partidos disponibles.</p>
          : matches.map(m => <MatchCard key={m.id} match={m} />)
      }
    </div>
  );
}

export default League;
