import { useNavigate } from 'react-router-dom';
import OddsDisplay from './OddsDisplay';
import { LEAGUES } from '../services/api';

function TeamBadge({ name }) {
  const initials = name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?';
  return (
    <div style={{
      width: 30, height: 30, borderRadius: '50%', background: '#1e2a45',
      border: '1px solid #2a3a5c',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 10, fontWeight: 'bold', color: '#8899bb', flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function MatchCard({ match, odds }) {
  const navigate = useNavigate();
  const status = match.status;
  const isLive = status === 'IN_PLAY' || status === 'PAUSED' || status === 'LIVE';
  const isFinished = status === 'FINISHED';
  const isUpcoming = status === 'TIMED' || status === 'SCHEDULED';

  const homeScore = match.score?.fullTime?.home ?? null;
  const awayScore = match.score?.fullTime?.away ?? null;
  const scoreText = homeScore !== null ? `${homeScore} - ${awayScore}` : 'vs';

  const getStatusLabel = () => {
    if (status === 'PAUSED') return 'Descanso';
    if (isLive) return 'En vivo';
    if (match.utcDate) {
      const date = new Date(match.utcDate);
      const hora = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      const dia = date.toLocaleDateString('es-ES', { weekday: 'short' });
      const fecha = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
    color: '#d0daf0', fontSize: 14, cursor: 'pointer',
    fontWeight: '500', transition: 'color 0.2s',
  };

  return (
    <div style={{
      padding: '14px 16px',
      borderBottom: '1px solid #111d30',
      background: isLive ? '#0f1d35' : '#0d1526',
      borderLeft: isLive ? '3px solid #f5c518' : '3px solid transparent',
      transition: 'background 0.2s',
    }}>
      {/* Competición */}
      {match.competition && (() => {
        const leagueData = Object.values(LEAGUES).find(l => l.code === match.competition.code);
        const emblem = leagueData?.emblem || match.competition.emblem;
        const darkCodes = new Set(['PL', 'FL1', 'CL', 'EL', 'ECL']);
        const isDark = leagueData?.dark || darkCodes.has(match.competition.code);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            {emblem && (
              <img src={emblem} alt="" style={{ width: 14, height: 14, objectFit: 'contain', opacity: 0.9, filter: isDark ? 'brightness(0) invert(1)' : 'none' }} />
            )}
            <span style={{ color: '#5a6a8a', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {match.competition.name}
            </span>
          </div>
        );
      })()}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '38%' }}>
          {homeCrest
            ? <img src={homeCrest} alt={homeName} style={{ width: 28, height: 28, objectFit: 'contain' }} />
            : <TeamBadge name={homeName} />
          }
          <span
            style={teamStyle}
            onClick={() => homeId && navigate(`/equipo/${homeId}`)}
            onMouseEnter={e => e.target.style.color = '#f5c518'}
            onMouseLeave={e => e.target.style.color = '#d0daf0'}
          >{homeName}</span>
        </div>

        {/* Marcador */}
        <div style={{ textAlign: 'center', minWidth: 110 }}>
          <div style={{
            color: isLive ? '#f5c518' : '#ffffff',
            fontWeight: '800', fontSize: 20, letterSpacing: 1,
          }}>
            {scoreText}
          </div>
          <div style={{
            color: isLive ? '#f5c518' : '#5a6a8a',
            fontSize: 11, marginTop: 3,
            whiteSpace: 'pre-line', lineHeight: 1.5,
            fontWeight: isLive ? '600' : '400',
          }}>
            {getStatusLabel()}
          </div>
        </div>

        {/* Equipo visitante */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '38%', justifyContent: 'flex-end' }}>
          <span
            style={teamStyle}
            onClick={() => awayId && navigate(`/equipo/${awayId}`)}
            onMouseEnter={e => e.target.style.color = '#f5c518'}
            onMouseLeave={e => e.target.style.color = '#d0daf0'}
          >{awayName}</span>
          {awayCrest
            ? <img src={awayCrest} alt={awayName} style={{ width: 28, height: 28, objectFit: 'contain' }} />
            : <TeamBadge name={awayName} />
          }
        </div>
      </div>

      {odds && (
        <OddsDisplay odds={odds} winner={isFinished ? match.score?.winner : null} />
      )}
    </div>
  );
}

export default MatchCard;
