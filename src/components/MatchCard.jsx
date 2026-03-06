function MatchCard({ match }) {
  const status = match.status;
  const isLive = status === 'IN_PLAY' || status === 'PAUSED' || status === 'LIVE';
  const isFinished = status === 'FINISHED';

  const homeScore = match.score?.fullTime?.home ?? match.score?.halfTime?.home ?? null;
  const awayScore = match.score?.fullTime?.away ?? match.score?.halfTime?.away ?? null;
  const scoreText = homeScore !== null ? `${homeScore} - ${awayScore}` : 'vs';

  const getStatusLabel = () => {
    if (isLive) return `⚡ En vivo`;
    if (status === 'PAUSED') return 'Descanso';
    if (isFinished) return 'Finalizado';
    if (match.utcDate) {
      return new Date(match.utcDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
    return '-';
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderBottom: '1px solid #2a2a3e',
      background: isLive ? '#1a1a2e' : '#16213e',
      borderLeft: isLive ? '3px solid #e94560' : '3px solid transparent',
    }}>
      {/* Equipo local */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '38%' }}>
        <span style={{ color: '#eee', fontSize: 14 }}>{match.homeTeam.shortName || match.homeTeam.name}</span>
      </div>

      {/* Marcador */}
      <div style={{ textAlign: 'center', minWidth: 100 }}>
        <div style={{ color: isLive ? '#e94560' : '#fff', fontWeight: 'bold', fontSize: 18 }}>
          {scoreText}
        </div>
        <div style={{ color: '#888', fontSize: 11, marginTop: 2 }}>{getStatusLabel()}</div>
      </div>

      {/* Equipo visitante */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '38%', justifyContent: 'flex-end' }}>
        <span style={{ color: '#eee', fontSize: 14 }}>{match.awayTeam.shortName || match.awayTeam.name}</span>
      </div>
    </div>
  );
}

export default MatchCard;
