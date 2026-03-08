function OddsDisplay({ odds, winner }) {
  if (!odds) return null;

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
        background: won ? '#1a3320' : '#0a1220',
        borderRadius: 6, padding: '5px 14px',
        border: `1px solid ${won ? '#2ecc71' : '#1e2a45'}`,
        minWidth: 56,
      }}>
        <span style={{ color: won ? '#2ecc71' : '#5a6a8a', fontSize: 10, fontWeight: '600' }}>{label}</span>
        <span style={{ color: won ? '#2ecc71' : '#f5c518', fontWeight: '700', fontSize: 14 }}>
          {value?.toFixed(2)}
        </span>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10 }}>
      {btn('1', odds.home, 'home')}
      {odds.draw && btn('X', odds.draw, 'draw')}
      {btn('2', odds.away, 'away')}
    </div>
  );
}

export default OddsDisplay;
