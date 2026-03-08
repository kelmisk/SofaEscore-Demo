import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTeamRecentMatches, getTeamUpcomingMatches, getStandings, getAllMatchesToday } from '../services/api';
import { getOdds, findOddsForMatch } from '../services/odds';
import MatchCard from '../components/MatchCard';

const TABS = ['Últimos partidos', 'Próximos partidos'];

function Team() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Últimos partidos');
  const [matches, setMatches] = useState([]);
  const [oddsMap, setOddsMap] = useState({});
  const [teamInfo, setTeamInfo] = useState(null);
  const [standing, setStanding] = useState(null);
  const [liveMatch, setLiveMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);

  // Comprobar si el equipo tiene partido en vivo
  useEffect(() => {
    getAllMatchesToday().then(matches => {
      const live = matches.find(m =>
        ['IN_PLAY', 'PAUSED', 'LIVE'].includes(m.status) &&
        (String(m.homeTeam?.id) === String(teamId) || String(m.awayTeam?.id) === String(teamId))
      );
      setLiveMatch(live || null);
    });
  }, [teamId]);

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

        // Cargar cuotas solo para próximos partidos
        if (tab === 'Próximos partidos' && data.length > 0) {
          const leagueCode = data[0].competition?.code;
          if (leagueCode) {
            const oddsList = await getOdds(leagueCode);
            if (currentId !== requestId.current) return;
            const map = {};
            data.forEach(m => {
              const o = findOddsForMatch(oddsList, m.homeTeam?.name, m.awayTeam?.name);
              if (o) map[m.id] = o;
            });
            setOddsMap(map);
          }
        } else {
          setOddsMap({});
        }

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
    if (pos <= 4) return '#4ade80';
    if (pos === 5) return '#60a5fa';
    if (pos === 6) return '#fb923c';
    if (pos >= 18) return '#f87171';
    return '#8899bb';
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>

      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <button onClick={() => navigate(-1)} style={{
          background: 'transparent', border: '1px solid #2a3a5c', color: '#8899bb',
          padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: '600',
        }}>← Volver</button>
        {teamInfo?.crest && (
          <img src={teamInfo.crest} alt={teamInfo.name} style={{ width: 48, height: 48, objectFit: 'contain' }} />
        )}
        <h1 style={{ color: '#f0f4ff', fontSize: 22, fontWeight: '700' }}>{teamInfo?.name || 'Equipo'}</h1>
      </div>

      {/* Clasificación */}
      {standing && (
        <div style={{
          background: '#0d1526', borderRadius: 12, padding: 16,
          marginBottom: 24, border: '1px solid #1a2540',
        }}>
          <div style={{ color: '#5a6a8a', fontSize: 12, marginBottom: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            🏆 {standing.leagueName} — Clasificación
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              { label: 'Posición', value: `${standing.position}º`, color: positionColor(standing.position) },
              { label: 'Puntos', value: standing.points, color: '#f5c518' },
              { label: 'PJ', value: standing.playedGames, color: '#f0f4ff' },
              { label: 'G', value: standing.won, color: '#4ade80' },
              { label: 'E', value: standing.draw, color: '#8899bb' },
              { label: 'P', value: standing.lost, color: '#f87171' },
              { label: 'DG', value: standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference, color: standing.goalDifference >= 0 ? '#4ade80' : '#f87171' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ color, fontSize: 26, fontWeight: '800' }}>{value}</div>
                <div style={{ color: '#5a6a8a', fontSize: 11, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partido en vivo */}
      {liveMatch && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ color: '#f5c518', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>⚡ En Vivo</h2>
          <div style={{ background: '#0d1526', borderRadius: 12, overflow: 'hidden', border: '1px solid #f5c518' }}>
            <MatchCard match={liveMatch} />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: tab === t ? '#f5c518' : '#1a2540',
            color: tab === t ? '#0a0e1a' : '#8899bb',
            fontWeight: tab === t ? '700' : '500', fontSize: 13,
          }}>
            {t}
          </button>
        ))}
      </div>

      {/* Partidos */}
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

export default Team;
