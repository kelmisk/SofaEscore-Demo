import { useEffect, useState } from 'react';
import { getAllMatchesToday, getDateString, LEAGUES } from '../services/api';
import { getOdds, findOddsForMatch } from '../services/odds';
import MatchCard from '../components/MatchCard';

function Home() {
  const [matches, setMatches] = useState([]);
  const [oddsMap, setOddsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const today = getDateString(0);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const all = await getAllMatchesToday();
        setMatches(all);

        // Cargar cuotas por liga
        const map = {};
        const leagueCodes = [...new Set(all.map(m => m.competition?.code).filter(Boolean))];
        for (const code of leagueCodes) {
          const oddsList = await getOdds(code);
          all.filter(m => m.competition?.code === code).forEach(m => {
            const o = findOddsForMatch(oddsList, m.homeTeam?.name, m.awayTeam?.name);
            if (o) map[m.id] = o;
          });
        }
        setOddsMap(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const liveMatches = matches.filter(m =>
    m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'LIVE'
  );
  const otherMatches = matches.filter(m =>
    m.status !== 'IN_PLAY' && m.status !== 'PAUSED' && m.status !== 'LIVE'
  );

  if (loading) return (
    <div style={{ padding: 24, color: '#8899bb', textAlign: 'center' }}>
      <p>⏳ Cargando partidos de hoy...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      {liveMatches.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ color: '#f5c518', marginBottom: 12, fontSize: 15, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>⚡ En Vivo</h2>
          <div style={{ background: '#0d1526', borderRadius: 12, overflow: 'hidden', border: '1px solid #1a2540' }}>
            {liveMatches.map(m => <MatchCard key={m.id} match={m} odds={oddsMap[m.id]} />)}
          </div>
        </section>
      )}
      <section>
        <h2 style={{ color: '#f0f4ff', marginBottom: 12, fontSize: 15, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>📅 Hoy — {today}</h2>
        <div style={{ background: '#0d1526', borderRadius: 12, overflow: 'hidden', border: '1px solid #1a2540' }}>
          {otherMatches.length === 0
            ? <p style={{ color: '#5a6a8a', padding: 24 }}>No hay más partidos programados hoy.</p>
            : otherMatches.map(m => <MatchCard key={m.id} match={m} odds={oddsMap[m.id]} />)
          }
        </div>
      </section>
    </div>
  );
}

export default Home;
