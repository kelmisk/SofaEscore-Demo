import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTeamRecentMatches, getTeamUpcomingMatches, getStandings, LEAGUES } from '../services/api';
import MatchCard from '../components/MatchCard';

const TABS = ['Últimos partidos', 'Próximos partidos'];

function Team() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Últimos partidos');
  const [matches, setMatches] = useState([]);
  const [teamInfo, setTeamInfo] = useState(null);
  const [standing, setStanding] = useState(null);
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
        if (currentId !== requestId.current) return;

        setMatches(data);

        // Extraer info del equipo y liga del primer partido
        if (data.length > 0) {
          const m = data[0];
          const isHome = String(m.homeTeam?.id) === String(teamId);
          const team = isHome ? m.homeTeam : m.awayTeam;
          if (team && !teamInfo) {
            setTeamInfo(team);

            // Buscar clasificación en la liga del partido
            const leagueCode = m.competition?.code;
            if (leagueCode) {
              const table = await getStandings(leagueCode);
              const row = table.find(r => String(r.team.id) === String(teamId));
              if (row) setStanding({ ...row, leagueCode, leagueName: m.competition?.name });
            }
          }
        }
      } catch (err) {
        console.error(err);
        if (currentId === requestId.current) setMatches([]);
      } finally {
        if (currentId === requestId.current) setLoading(false);
      }
    }
    fetchMatches();
  }, [teamId, tab]);

  const positionColor = (pos) => {
    if (pos <= 4) return '#4caf50';
    if (pos === 5) return '#2196f3';
    if (pos === 6) return '#ff9800';
    if (pos >= 18) return '#e94560';
    return '#aaa';
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>

      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <button onClick={() => navigate(-1)} style={{
          background: '#2a2a3e', border: 'none', color: '#aaa',
          padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 16,
        }}>← Volver</button>
        {teamInfo?.crest && (
          <img src={teamInfo.crest} alt={teamInfo.name} style={{ width: 48, height: 48, objectFit: 'contain' }} />
        )}
        <h1 style={{ color: '#fff', fontSize: 22 }}>{teamInfo?.name || 'Equipo'}</h1>
      </div>

      {/* Clasificación */}
      {standing && (
        <div style={{
          background: '#16213e', borderRadius: 12, padding: 16,
          marginBottom: 24, border: '1px solid #2a2a3e',
        }}>
          <div style={{ color: '#888', fontSize: 12, marginBottom: 10 }}>
            🏆 {standing.leagueName} — Clasificación
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: positionColor(standing.position), fontSize: 28, fontWeight: 'bold' }}>
                {standing.position}º
              </div>
              <div style={{ color: '#888', fontSize: 11 }}>Posición</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>{standing.points}</div>
              <div style={{ color: '#888', fontSize: 11 }}>Puntos</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>{standing.playedGames}</div>
              <div style={{ color: '#888', fontSize: 11 }}>PJ</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#4caf50', fontSize: 28, fontWeight: 'bold' }}>{standing.won}</div>
              <div style={{ color: '#888', fontSize: 11 }}>G</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#aaa', fontSize: 28, fontWeight: 'bold' }}>{standing.draw}</div>
              <div style={{ color: '#888', fontSize: 11 }}>E</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#e94560', fontSize: 28, fontWeight: 'bold' }}>{standing.lost}</div>
              <div style={{ color: '#888', fontSize: 11 }}>P</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: standing.goalDifference >= 0 ? '#4caf50' : '#e94560', fontSize: 28, fontWeight: 'bold' }}>
                {standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference}
              </div>
              <div style={{ color: '#888', fontSize: 11 }}>DG</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
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
