import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LEAGUES, getLiveFixtures, getRecentFixtures, getUpcomingFixtures, getFixturesToday } from '../services/api';
import { getOdds, findOddsForMatch } from '../services/odds';
import MatchCard from '../components/MatchCard';

const TABS = ['En Vivo', 'Hoy', 'Últimos partidos', 'Próximos partidos'];

function League() {
  const { leagueKey } = useParams();
  const navigate = useNavigate();
  const league = LEAGUES[leagueKey];
  const [tab, setTab] = useState('Últimos partidos');
  const [matches, setMatches] = useState([]);
  const [oddsMap, setOddsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);

  useEffect(() => {
    setMatches([]);
    setOddsMap({});
    setTab('Últimos partidos');
  }, [leagueKey]);

  useEffect(() => {
    if (!league) return;
    const currentId = ++requestId.current;

    async function fetchMatches() {
      setLoading(true);
      try {
        let data = [];
        if (tab === 'En Vivo')           data = await getLiveFixtures(league.code);
        if (tab === 'Hoy')               data = await getFixturesToday(league.code);
        if (tab === 'Últimos partidos')  data = await getRecentFixtures(league.code);
        if (tab === 'Próximos partidos') data = await getUpcomingFixtures(league.code);

        if (currentId !== requestId.current) return;
        setMatches(data);

        // Cuotas solo para partidos futuros y en vivo (API gratuita no tiene histórico)
        const map = {};
        if (tab !== 'Últimos partidos') {
          const oddsList = await getOdds(league.code);
          if (currentId !== requestId.current) return;
          data.forEach(m => {
            const o = findOddsForMatch(oddsList, m.homeTeam?.name, m.awayTeam?.name);
            if (o) map[m.id] = o;
          });
        }
        if (currentId !== requestId.current) return;
        setOddsMap(map);
      } catch (err) {
        if (currentId === requestId.current) {
          console.error(err);
          setMatches([]);
        }
      } finally {
        if (currentId === requestId.current) setLoading(false);
      }
    }

    fetchMatches();
  }, [leagueKey, tab]);

  if (!league) return <p style={{ color: '#aaa', padding: 24 }}>Liga no encontrada.</p>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        {league.emblem && <img src={league.emblem} alt={league.name} onError={e => e.target.style.display='none'} style={{ width: 40, height: 40, objectFit: 'contain', filter: league.dark ? 'brightness(0) invert(1)' : 'none' }} />}
        <h1 style={{ color: '#f0f4ff', fontSize: 20, fontWeight: '700' }}>{league.name}</h1>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: tab === t ? '#f5c518' : '#1a2540',
            color: tab === t ? '#0a0e1a' : '#8899bb',
            fontWeight: tab === t ? '700' : '500',
            fontSize: 13,
          }}>
            {t}
          </button>
        ))}
        <button
          onClick={() => navigate(`/liga/${leagueKey}/clasificacion`)}
          style={{ padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', background: '#1a2540', color: '#8899bb', fontSize: 13 }}
        >
          🏆 Clasificación
        </button>
      </div>

      <div style={{ background: '#0d1526', borderRadius: 12, overflow: 'hidden', border: '1px solid #1a2540' }}>
        {loading
          ? <p style={{ color: '#8899bb', padding: 24 }}>Cargando...</p>
          : matches.length === 0
            ? <p style={{ color: '#5a6a8a', padding: 24 }}>No hay partidos disponibles.</p>
            : matches.map(m => <MatchCard key={m.id} match={m} odds={oddsMap[m.id]} />)
        }
      </div>
    </div>
  );
}

export default League;
