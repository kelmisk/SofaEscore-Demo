import { useEffect, useState } from 'react';
import { LEAGUES, getFixturesToday, getLiveFixtures, getDateString } from '../services/api';
import MatchCard from '../components/MatchCard';

function Home() {
  const [liveMatches, setLiveMatches] = useState([]);
  const [todayMatches, setTodayMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = getDateString(0);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const leagueCodes = Object.values(LEAGUES).map(l => l.code);
        const [liveResults, todayResults] = await Promise.all([
          Promise.all(leagueCodes.map(code => getLiveFixtures(code))),
          Promise.all(leagueCodes.map(code => getFixturesToday(code))),
        ]);
        setLiveMatches(liveResults.flat());
        setTodayMatches(todayResults.flat().filter(m => m.status !== 'IN_PLAY' && m.status !== 'LIVE'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p style={{ color: '#aaa', padding: 24 }}>Cargando partidos...</p>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      {liveMatches.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: '#e94560', marginBottom: 12 }}>⚡ En Vivo</h2>
          {liveMatches.map(m => <MatchCard key={m.id} match={m} />)}
        </section>
      )}
      <section>
        <h2 style={{ color: '#fff', marginBottom: 12 }}>📅 Hoy — {today}</h2>
        {todayMatches.length === 0
          ? <p style={{ color: '#888' }}>No hay más partidos programados hoy.</p>
          : todayMatches.map(m => <MatchCard key={m.id} match={m} />)
        }
      </section>
    </div>
  );
}

export default Home;
