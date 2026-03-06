import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getTeamRecentMatches, getTeamUpcomingMatches } from '../services/api';
import MatchCard from '../components/MatchCard';

const TABS = ['Últimos partidos', 'Próximos partidos'];

function Team() {
  const { teamId } = useParams();
  const [tab, setTab] = useState('Últimos partidos');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);

  useEffect(() => {
    const currentId = ++requestId.current;
    async function fetchMatches() {
      setLoading(true);
      setMatches([]);
      try {
        let data = [];
        if (tab === 'Últimos partidos')  data = await getTeamRecentMatches(teamId);
        if (tab === 'Próximos partidos') data = await getTeamUpcomingMatches(teamId);
        if (currentId === requestId.current) setMatches(data);
      } catch (err) {
        console.error(err);
        if (currentId === requestId.current) setMatches([]);
      } finally {
        if (currentId === requestId.current) setLoading(false);
      }
    }
    fetchMatches();
  }, [teamId, tab]);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>

      {/* Tabs */}
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
      </div>

      {/* Partidos */}
      {loading
        ? <p style={{ color: '#aaa' }}>Cargando...</p>
        : matches.length === 0
          ? <p style={{ color: '#888' }}>No hay partidos disponibles.</p>
          : matches.map(m => <MatchCard key={m.id} match={m} />)
      }
    </div>
  );
}

export default Team;
