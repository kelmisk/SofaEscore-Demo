function OddsDisplay({ odds, winner }) {
  if (!odds) return null;

  // winner: 'HOME_TEAM', 'AWAY_TEAM', 'DRAW', o null
  const isWinner = (side) => {
    if (side === 'home') return winner === 'HOME_TEAM';
    if (side === 'draw') return winner === 'DRAW';
    if (side === 'away') return winner === 'AWAY_TEAM';
    return false;
  };

  const btn = (label, value, side) => {
    const won = isWinner(side);
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: won ? '#1a3a1a' : '#0f0f1a',
        borderRadius: 8, padding: '4px 12px',
        border: `1px solid ${won ? '#4caf50' : '#2a2a3e'}`,
        minWidth: 52,
      }}>
        <span style={{ color: won ? '#4caf50' : '#888', fontSize: 10 }}>{label}</span>
        <span style={{ color: won ? '#4caf50' : '#e94560', fontWeight: 'bold', fontSize: 14 }}>
          {value?.toFixed(2)}
        </span>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
      {btn('1', odds.home, 'home')}
      {odds.draw && btn('X', odds.draw, 'draw')}
      {btn('2', odds.away, 'away')}
    </div>
  );
}

export default OddsDisplay;
