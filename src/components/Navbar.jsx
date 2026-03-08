import { Link, useLocation } from 'react-router-dom';
import { LEAGUES } from '../services/api';

function Navbar() {
  const location = useLocation();
  const active = (path) => location.pathname === path;

  const linkStyle = (isActive) => ({
    padding: '14px 14px',
    color: isActive ? '#f5c518' : '#8899bb',
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: isActive ? '700' : '500',
    whiteSpace: 'nowrap',
    borderBottom: isActive ? '3px solid #f5c518' : '3px solid transparent',
    transition: 'color 0.2s',
    letterSpacing: '0.3px',
  });

  return (
    <nav style={{
      background: '#0d1526',
      padding: '0 20px',
      borderBottom: '1px solid #1a2540',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      overflowX: 'auto',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
    }}>
      <Link to="/" style={{ ...linkStyle(active('/')), fontSize: 15 }}>SofaEscore</Link>

      <div style={{ width: 1, height: 20, background: '#1a2540', margin: '0 8px', flexShrink: 0 }} />

      {Object.entries(LEAGUES).map(([key, league]) => (
        <Link key={key} to={`/liga/${key}`} style={linkStyle(active(`/liga/${key}`))}>
          {league.flag} {league.name}
        </Link>
      ))}

      <Link to="/buscar" style={{ ...linkStyle(active('/buscar')), marginLeft: 'auto' }}>
        🔍 Buscar
      </Link>
    </nav>
  );
}

export default Navbar;
