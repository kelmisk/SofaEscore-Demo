import { useNavigate } from 'react-router-dom';

function TeamBadge({ name }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  const colors = ['#e94560', '#0f3460', '#533483', '#16213e', '#1a1a2e'];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%', background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 10, fontWeight: 'bold', color: '#fff', flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function MatchCard({ match }) {
  const navigate = useNavigate();
  const status = match.status;
  const isLive = status === 'IN_PLAY' || status === 'PAUSED' || status === 'LIVE';
  const isFinished = status === 'FINISHED';

  const homeScore = match.score?.fullTime?.home ?? null;
  const awayScore = match.score?.fullTime?.away ?? null;
  const scoreText = homeScore !== null ? `${homeScore} - ${awayScore}` : 'vs';

  const getStatusLabel = () => {
    if (isLive) return '⚡ En vivo';
    if (status === 'PAUSED') return 'Descanso';
    if (isFinished) return 'Finalizado';
    if (match.utcDate) {
      const date = new Date(match.utcDate);
      const hora = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      const dia = date.toLocaleDateString('es-ES', { weekday: 'short' });
      const fecha = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
      return `${dia.charAt(0).toUpperCase() + dia.slice(1)} ${hora}\n${fecha}`;
    }
    return '-';
  };

  const homeName = match.homeTeam?.shortName || match.homeTeam?.name || '';
  const awayName = match.awayTeam?.shortName || match.awayTeam?.name || '';
  const homeId = match.homeTeam?.id;
  const awayId = match.awayTeam?.id;
  const homeCrest = match.homeTeam?.crest;
  const awayCrest = match.awayTeam?.crest;

  const teamStyle = {
    color: '#eee', fontSize: 14, cursor: 'pointer',
    textDecoration: 'none', transition: 'color 0.2s',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', borderBottom: '1px solid #2a2a3e',
      background: isLive ? '#1a1a2e' : '#16213e',
      borderLeft: isLive ? '3px solid #e94560' : '3px solid transparent',
    }}>
      {/* Equipo local */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '38%' }}>
        {homeCrest
          ? <img src={homeCrest} alt={homeName} style={{ width: 28, height: 28, objectFit: 'contain' }} />
          : <TeamBadge name={homeName} />
        }
        <span
          style={teamStyle}
          onClick={() => homeId && navigate(`/equipo/${homeId}`)}
          onMouseEnter={e => e.target.style.color = '#e94560'}
          onMouseLeave={e => e.target.style.color = '#eee'}
        >
          {homeName}
        </span>
      </div>

      {/* Marcador */}
      <div style={{ textAlign: 'center', minWidth: 100 }}>
        <div style={{ color: isLive ? '#e94560' : '#fff', fontWeight: 'bold', fontSize: 18 }}>
          {scoreText}
        </div>
        <div style={{ color: '#888', fontSize: 11, marginTop: 2, whiteSpace: 'pre-line', lineHeight: 1.4 }}>
          {getStatusLabel()}
        </div>
      </div>

      {/* Equipo visitante */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '38%', justifyContent: 'flex-end' }}>
        <span
          style={teamStyle}
          onClick={() => awayId && navigate(`/equipo/${awayId}`)}
          onMouseEnter={e => e.target.style.color = '#e94560'}
          onMouseLeave={e => e.target.style.color = '#eee'}
        >
          {awayName}
        </span>
        {awayCrest
          ? <img src={awayCrest} alt={awayName} style={{ width: 28, height: 28, objectFit: 'contain' }} />
          : <TeamBadge name={awayName} />
        }
      </div>
    </div>
  );
}

export default MatchCard;
