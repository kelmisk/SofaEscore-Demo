const BASE_URL = '/api';
const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY;
const headers = { 'X-Auth-Token': API_KEY };

// Cache: 5 minutos por ruta
const cache = {};
const CACHE_TTL = 5 * 60 * 1000;

// Cola para limitar a 1 petición cada 700ms (max ~10/min)
let lastRequestTime = 0;
const MIN_INTERVAL = 700;

async function apiFetch(path) {
  // Devolver caché si existe y es reciente
  const now = Date.now();
  if (cache[path] && now - cache[path].ts < CACHE_TTL) {
    return cache[path].data;
  }

  // Esperar si la última petición fue hace menos de 700ms
  const wait = MIN_INTERVAL - (Date.now() - lastRequestTime);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastRequestTime = Date.now();

  const res = await fetch(`${BASE_URL}${path}`, { headers });

  if (res.status === 429) {
    // Rate limit: esperar 15 segundos y reintentar
    await new Promise(r => setTimeout(r, 15000));
    return apiFetch(path);
  }

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  cache[path] = { data, ts: Date.now() };
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
