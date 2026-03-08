import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LEAGUES, getStandings } from '../services/api';

function getPositionColor(index) {
  if (index < 4) return '#4ade80';
  if (index < 5) return '#60a5fa';
  if (index < 6) return '#fb923c';
  if (index >= 17) return '#f87171';
  return '#8899bb';
}

function Standings() {
  const { leagueKey } = useParams();
  const league = LEAGUES[leagueKey];
  const [table, setTable] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!league) return;
    async function fetch() {
      setLoading(true);
      try { setTable(await getStandings(league.code)); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetch();
  }, [leagueKey]);

  if (!league) return <p style={{ color: '#8899bb', padding: 24 }}>Liga no encontrada.</p>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <button onClick={() => navigate(-1)} style={{
          background: 'transparent', border: '1px solid #2a3a5c', color: '#8899bb',
          padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: '600',
        }}>← Volver</button>
        <h1 style={{ color: '#f0f4ff', fontSize: 20, fontWeight: '700' }}>
          {league.flag} {league.name} — Clasificación
        </h1>
      </div>

      {loading ? <p style={{ color: '#8899bb' }}>Cargando clasificación...</p> : (
        <div style={{ background: '#0d1526', borderRadius: 12, overflow: 'hidden', border: '1px solid #1a2540' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#0a1220', color: '#5a6a8a', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  <th style={{ padding: '10px 8px', textAlign: 'center', width: 32 }}>#</th>
                  <th style={{ padding: '10px 8px', textAlign: 'left' }}>Equipo</th>
                  <th style={{ padding: '10px 6px', textAlign: 'center' }}>PJ</th>
                  <th style={{ padding: '10px 6px', textAlign: 'center' }}>G</th>
                  <th style={{ padding: '10px 6px', textAlign: 'center' }}>E</th>
                  <th style={{ padding: '10px 6px', textAlign: 'center' }}>P</th>
                  <th style={{ padding: '10px 6px', textAlign: 'center' }}>GF</th>
                  <th style={{ padding: '10px 6px', textAlign: 'center' }}>GC</th>
                  <th style={{ padding: '10px 6px', textAlign: 'center' }}>DG</th>
                  <th style={{ padding: '10px 6px', textAlign: 'center', color: '#f5c518' }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row, i) => (
                  <tr key={row.team.id}
                    onClick={() => navigate(`/equipo/${row.team.id}`)}
                    style={{ borderBottom: '1px solid #111d30', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1a2540'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <span style={{ color: getPositionColor(i), fontWeight: '700', fontSize: 13 }}>{row.position}</span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {row.team.crest && <img src={row.team.crest} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />}
                        <span style={{ color: '#d0daf0', fontWeight: '500' }}>{row.team.shortName || row.team.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 6px', textAlign: 'center', color: '#8899bb' }}>{row.playedGames}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'center', color: '#8899bb' }}>{row.won}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'center', color: '#8899bb' }}>{row.draw}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'center', color: '#8899bb' }}>{row.lost}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'center', color: '#8899bb' }}>{row.goalsFor}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'center', color: '#8899bb' }}>{row.goalsAgainst}</td>
                    <td style={{ padding: '10px 6px', textAlign: 'center', color: row.goalDifference > 0 ? '#4ade80' : row.goalDifference < 0 ? '#f87171' : '#8899bb', fontWeight: '600' }}>
                      {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                    </td>
                    <td style={{ padding: '10px 6px', textAlign: 'center', color: '#f5c518', fontWeight: '700' }}>{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && (
        <div style={{ marginTop: 14, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ color: '#4ade80', fontSize: 12 }}>● Champions League</span>
          <span style={{ color: '#60a5fa', fontSize: 12 }}>● Europa League</span>
          <span style={{ color: '#fb923c', fontSize: 12 }}>● Conference League</span>
          <span style={{ color: '#f87171', fontSize: 12 }}>● Descenso</span>
        </div>
      )}
    </div>
  );
}

export default Standings;
