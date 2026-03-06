import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LEAGUES, getStandings } from '../services/api';

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
      try {
        const data = await getStandings(league.code);
        setTable(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [leagueKey]);

  if (!league) return <p style={{ color: '#aaa', padding: 24 }}>Liga no encontrada.</p>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      <h1 style={{ color: '#fff', marginBottom: 20 }}>{league.flag} {league.name} — Clasificación</h1>

      {loading
        ? <p style={{ color: '#aaa' }}>Cargando clasificación...</p>
        : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ color: '#888', borderBottom: '1px solid #2a2a3e' }}>
                  <th style={{ padding: '8px 4px', textAlign: 'center', width: 32 }}>#</th>
                  <th style={{ padding: '8px 8px', textAlign: 'left' }}>Equipo</th>
                  <th style={{ padding: '8px 4px', textAlign: 'center' }}>PJ</th>
                  <th style={{ padding: '8px 4px', textAlign: 'center' }}>G</th>
                  <th style={{ padding: '8px 4px', textAlign: 'center' }}>E</th>
                  <th style={{ padding: '8px 4px', textAlign: 'center' }}>P</th>
                  <th style={{ padding: '8px 4px', textAlign: 'center' }}>GF</th>
                  <th style={{ padding: '8px 4px', textAlign: 'center' }}>GC</th>
                  <th style={{ padding: '8px 4px', textAlign: 'center' }}>DG</th>
                  <th style={{ padding: '8px 4px', textAlign: 'center', color: '#e94560' }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row, i) => (
                  <tr
                    key={row.team.id}
                    onClick={() => navigate(`/equipo/${row.team.id}`)}
                    style={{
                      borderBottom: '1px solid #2a2a3e',
                      background: i % 2 === 0 ? '#16213e' : '#1a1a2e',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#2a2a3e'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#16213e' : '#1a1a2e'}
                  >
                    <td style={{ padding: '10px 4px', textAlign: 'center', color: getPositionColor(i, leagueKey), fontWeight: 'bold' }}>
                      {row.position}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {row.team.crest && (
                          <img src={row.team.crest} alt={row.team.name} style={{ width: 20, height: 20, objectFit: 'contain' }} />
                        )}
                        <span style={{ color: '#eee' }}>{row.team.shortName || row.team.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 4px', textAlign: 'center', color: '#aaa' }}>{row.playedGames}</td>
                    <td style={{ padding: '10px 4px', textAlign: 'center', color: '#aaa' }}>{row.won}</td>
                    <td style={{ padding: '10px 4px', textAlign: 'center', color: '#aaa' }}>{row.draw}</td>
                    <td style={{ padding: '10px 4px', textAlign: 'center', color: '#aaa' }}>{row.lost}</td>
                    <td style={{ padding: '10px 4px', textAlign: 'center', color: '#aaa' }}>{row.goalsFor}</td>
                    <td style={{ padding: '10px 4px', textAlign: 'center', color: '#aaa' }}>{row.goalsAgainst}</td>
                    <td style={{ padding: '10px 4px', textAlign: 'center', color: row.goalDifference > 0 ? '#4caf50' : row.goalDifference < 0 ? '#e94560' : '#aaa' }}>
                      {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                    </td>
                    <td style={{ padding: '10px 4px', textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      {/* Leyenda */}
      {!loading && (
        <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ color: '#4caf50', fontSize: 12 }}>● Champions League</span>
          <span style={{ color: '#2196f3', fontSize: 12 }}>● Europa League</span>
          <span style={{ color: '#ff9800', fontSize: 12 }}>● Conference League</span>
          <span style={{ color: '#e94560', fontSize: 12 }}>● Descenso</span>
        </div>
      )}
    </div>
  );
}

function getPositionColor(index, leagueKey) {
  if (index < 4) return '#4caf50';
  if (index < 5) return '#2196f3';
  if (index < 6) return '#ff9800';
  if (index >= 17) return '#e94560';
  return '#aaa';
}

export default Standings;
