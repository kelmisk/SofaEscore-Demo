const BASE_URL = '/api';
const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY;

const headers = { 'X-Auth-Token': API_KEY };

// Cache simple para evitar llamadas repetidas
const cache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

async function apiFetch(path) {
  const now = Date.now();
  if (cache[path] && now - cache[path].ts < CACHE_TTL) {
    return cache[path].data;
  }
  const res = await fetch(`${BASE_URL}${path}`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  cache[path] = { data, ts: now };
  return data;
}

export const LEAGUES = {
  laliga:     { code: 'PD',  id: 2014, name: 'La Liga',        country: 'España',     flag: '🇪🇸' },
  premier:    { code: 'PL',  id: 2021, name: 'Premier League', country: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  seriea:     { code: 'SA',  id: 2019, name: 'Serie A',        country: 'Italia',     flag: '🇮🇹' },
  bundesliga: { code: 'BL1', id: 2002, name: 'Bundesliga',     country: 'Alemania',   flag: '🇩🇪' },
  ligue1:     { code: 'FL1', id: 2015, name: 'Ligue 1',        country: 'Francia',    flag: '🇫🇷' },
};

export function getDateString(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export async function getFixturesToday(leagueCode) {
  const today = getDateString(0);
  const data = await apiFetch(`/competitions/${leagueCode}/matches?dateFrom=${today}&dateTo=${today}`);
  return data.matches || [];
}

export async function getRecentFixtures(leagueCode) {
  const from = getDateString(-14);
  const to = getDateString(0);
  const data = await apiFetch(`/competitions/${leagueCode}/matches?dateFrom=${from}&dateTo=${to}&status=FINISHED`);
  return data.matches || [];
}

export async function getUpcomingFixtures(leagueCode) {
  const from = getDateString(1);
  const to = getDateString(14);
  const data = await apiFetch(`/competitions/${leagueCode}/matches?dateFrom=${from}&dateTo=${to}&status=SCHEDULED`);
  return data.matches || [];
}

export async function getLiveFixtures(leagueCode) {
  const data = await apiFetch(`/competitions/${leagueCode}/matches?status=IN_PLAY,PAUSED,LIVE`);
  return data.matches || [];
}
