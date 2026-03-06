import { Link, useLocation } from 'react-router-dom';
import { LEAGUES } from '../services/api';

function Navbar() {
  const location = useLocation();
  const active = (path) => location.pathname === path;

  const linkStyle = (isActive) => ({
    padding: '16px 12px',
    color: isActive ? '#e94560' : '#aaa',
    textDecoration: 'none',
    fontSize: 14,
    whiteSpace: 'nowrap',
    borderBottom: isActive ? '2px solid #e94560' : '2px solid transparent',
    fontWeight: isActive ? 'bold' : 'normal',
  });

  return (
    <nav style={{
      background: '#0f0f1a',
      padding: '0 16px',
      borderBottom: '1px solid #2a2a3e',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      overflowX: 'auto',
    }}>
      <Link to="/" style={linkStyle(active('/'))}>🏠 Inicio</Link>

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
