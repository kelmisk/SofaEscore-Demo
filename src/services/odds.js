const ODDS_API_KEY = import.meta.env.VITE_ODDS_API_KEY;
const ODDS_BASE_URL = 'https://api.the-odds-api.com/v4';

const LEAGUE_KEYS = {
  PD:  'soccer_spain_la_liga',
  PL:  'soccer_epl',
  SA:  'soccer_italy_serie_a',
  BL1: 'soccer_germany_bundesliga',
  FL1: 'soccer_france_ligue_one',
};

const ODDS_TTL = 10 * 60 * 1000;
const oddsCache = {};

function normalize(s) {
  return s?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
}

export async function getOdds(leagueCode) {
  const sportKey = LEAGUE_KEYS[leagueCode];
  if (!sportKey) return [];

  const now = Date.now();
  if (oddsCache[leagueCode] && now - oddsCache[leagueCode].ts < ODDS_TTL) {
    return oddsCache[leagueCode].data;
  }

  try {
    const res = await fetch(
      `${ODDS_BASE_URL}/sports/${sportKey}/odds?apiKey=${ODDS_API_KEY}&regions=eu&markets=h2h&oddsFormat=decimal`
    );
    if (!res.ok) return [];
    const data = await res.json();
    oddsCache[leagueCode] = { data, ts: now };
    return data;
  } catch {
    return [];
  }
}

export function findOddsForMatch(oddsList, homeName, awayName) {
  if (!oddsList?.length) return null;
  const homeN = normalize(homeName);
  const awayN = normalize(awayName);

  const match = oddsList.find(o => {
    const h = normalize(o.home_team);
    const a = normalize(o.away_team);
    return (h.includes(homeN) || homeN.includes(h)) &&
           (a.includes(awayN) || awayN.includes(a));
  });

  if (!match) return null;

  const h2h = match.bookmakers?.[0]?.markets?.find(m => m.key === 'h2h');
  if (!h2h) return null;

  const outcomes = h2h.outcomes;
  const home = outcomes.find(o => normalize(o.name) === normalize(match.home_team))?.price;
  const away = outcomes.find(o => normalize(o.name) === normalize(match.away_team))?.price;
  const draw = outcomes.find(o => o.name === 'Draw')?.price;

  if (!home || !away) return null;
  return { home, draw, away };
}
