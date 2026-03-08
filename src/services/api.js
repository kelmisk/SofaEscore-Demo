const IS_DEV = import.meta.env.DEV;
const BASE_URL = IS_DEV ? '/api' : '/api';
const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY;
const headers = { 'X-Auth-Token': API_KEY };

const cache = {};
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos
const LIVE_TTL  =  1 * 60 * 1000; // 1 minuto para rutas en vivo

// Cargar caché desde localStorage al arrancar
function loadCacheFromStorage() {
  try {
    const stored = localStorage.getItem('api_cache');
    if (stored) {
      const parsed = JSON.parse(stored);
      const now = Date.now();
      Object.entries(parsed).forEach(([key, val]) => {
        // No cargar NUNCA rutas de partidos desde localStorage — siempre frescos
        const isMatchRoute = key.includes('/matches') || key.includes('/competitions/');
        if (!isMatchRoute && now - val.ts < CACHE_TTL) cache[key] = val;
      });
    }
  } catch {}
}

function saveCacheToStorage() {
  try {
    localStorage.setItem('api_cache', JSON.stringify(cache));
  } catch {}
}

// Limpiar siempre el caché de partidos del localStorage al arrancar
try {
  const stored = localStorage.getItem('api_cache');
  if (stored) {
    const parsed = JSON.parse(stored);
    const cleaned = {};
    Object.entries(parsed).forEach(([key, val]) => {
      const isMatchRoute = key.includes('/matches') || key.includes('/competitions/');
      if (!isMatchRoute) cleaned[key] = val;
    });
    localStorage.setItem('api_cache', JSON.stringify(cleaned));
  }
} catch {}

loadCacheFromStorage();

let lastRequestTime = 0;
const MIN_INTERVAL = 1500; // 1.5s entre peticiones = máx 40/min, bien por debajo del límite

export function clearMatchCache() {
  Object.keys(cache).forEach(key => {
    if (key.includes('/matches') || key.includes('/competitions/')) {
      delete cache[key];
    }
  });
}

async function apiFetch(path, live = false) {
  const now = Date.now();
  const ttl = live ? LIVE_TTL : CACHE_TTL;
  if (cache[path] && now - cache[path].ts < ttl) {
    return cache[path].data;
  }
  const wait = MIN_INTERVAL - (Date.now() - lastRequestTime);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastRequestTime = Date.now();

  const res = await fetch(`${BASE_URL}${path}`, { headers });
  if (res.status === 429) {
    await new Promise(r => setTimeout(r, 15000));
    return apiFetch(path);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  cache[path] = { data, ts: Date.now() };
  saveCacheToStorage();
  return data;
}

export const LEAGUES = {
  laliga:     { code: 'PD',  id: 2014, name: 'La Liga',        country: 'España',     flag: '🇪🇸', emblem: '/leagues/laliga.png',     dark: false },
  premier:    { code: 'PL',  id: 2021, name: 'Premier League', country: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', emblem: '/leagues/premier.png',    dark: true  },
  seriea:     { code: 'SA',  id: 2019, name: 'Serie A',        country: 'Italia',     flag: '🇮🇹', emblem: '/leagues/seriea.png',     dark: false },
  bundesliga: { code: 'BL1', id: 2002, name: 'Bundesliga',     country: 'Alemania',   flag: '🇩🇪', emblem: '/leagues/bundesliga.png', dark: false },
  ligue1:     { code: 'FL1', id: 2015, name: 'Ligue 1',        country: 'Francia',    flag: '🇫🇷', emblem: '/leagues/ligue1.png',     dark: true  },
};

export function getDateString(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

// Cargar todos los equipos de las 5 ligas (con caché larga)
let allTeamsCache = null;
let loadingTeams = false;
let loadingCallbacks = [];

// Cargar equipos desde localStorage si existen
try {
  const stored = localStorage.getItem('all_teams_cache');
  if (stored) {
    const { data, ts } = JSON.parse(stored);
    if (Date.now() - ts < 24 * 60 * 60 * 1000) allTeamsCache = data; // 24h
  }
} catch {}

export function teamsReady() {
  return allTeamsCache !== null;
}

export async function getAllTeams() {
  if (allTeamsCache) return allTeamsCache;

  // Si ya hay una carga en progreso, esperar a que termine
  if (loadingTeams) {
    return new Promise(resolve => loadingCallbacks.push(resolve));
  }

  loadingTeams = true;
  const leagues = Object.values(LEAGUES);
  const all = [];

  for (const l of leagues) {
    const data = await apiFetch(`/competitions/${l.code}/teams`);
    const teams = (data.teams || []).map(t => ({ ...t, leagueName: l.name, leagueFlag: l.flag }));
    all.push(...teams);
  }

  allTeamsCache = all;
  loadingTeams = false;
  loadingCallbacks.forEach(cb => cb(allTeamsCache));
  loadingCallbacks = [];
  try { localStorage.setItem('all_teams_cache', JSON.stringify({ data: all, ts: Date.now() })); } catch {}
  return allTeamsCache;
}

// Buscar equipos localmente por nombre
export async function searchTeams(query) {
  const teams = await getAllTeams();
  const q = query.toLowerCase();
  return teams.filter(t =>
    t.name?.toLowerCase().includes(q) ||
    t.shortName?.toLowerCase().includes(q)
  );
}

export async function getFixturesToday(leagueCode) {
  const today = getDateString(0);
  const data = await apiFetch(`/competitions/${leagueCode}/matches?dateFrom=${today}&dateTo=${today}`, true); // live TTL
  return data.matches || [];
}

// Una sola petición para todos los partidos del día de las 5 ligas
export async function getAllMatchesToday() {
  const today = getDateString(0);
  const data = await apiFetch(`/matches?date=${today}`, true); // live TTL
  const leagueIdSet = new Set(Object.values(LEAGUES).map(l => l.id));
  return (data.matches || []).filter(m => leagueIdSet.has(m.competition?.id));
}

export async function getRecentFixtures(leagueCode) {
  const from = getDateString(-30);
  const to = getDateString(0);
  const data = await apiFetch(`/competitions/${leagueCode}/matches?dateFrom=${from}&dateTo=${to}&status=FINISHED`);
  const matches = data.matches || [];
  if (matches.length === 0) return [];

  // Coger solo la última jornada jugada
  const lastMatchday = Math.max(...matches.map(m => m.matchday));
  return matches.filter(m => m.matchday === lastMatchday);
}

export async function getUpcomingFixtures(leagueCode) {
  const from = getDateString(0);
  const to = getDateString(30);
  const data = await apiFetch(`/competitions/${leagueCode}/matches?dateFrom=${from}&dateTo=${to}&status=SCHEDULED,TIMED`);
  const matches = data.matches || [];
  if (matches.length === 0) return [];

  // Coger el matchday más próximo que aparezca en los resultados
  const nextMatchday = Math.min(...matches.map(m => m.matchday));
  return matches.filter(m => m.matchday === nextMatchday);
}

export async function getLiveFixtures(leagueCode) {
  const data = await apiFetch(`/competitions/${leagueCode}/matches?status=IN_PLAY,PAUSED,LIVE`, true); // live TTL
  return data.matches || [];
}

export async function getStandings(leagueCode) {
  const data = await apiFetch(`/competitions/${leagueCode}/standings`);
  return data.standings?.[0]?.table || [];
}

export async function getTeamRecentMatches(teamId) {
  const from = getDateString(-60);
  const to = getDateString(0);
  const data = await apiFetch(`/teams/${teamId}/matches?dateFrom=${from}&dateTo=${to}&status=FINISHED`);
  return data.matches || [];
}

export async function getTeamUpcomingMatches(teamId) {
  const from = getDateString(0);
  const to = getDateString(30);
  const data = await apiFetch(`/teams/${teamId}/matches?dateFrom=${from}&dateTo=${to}&status=SCHEDULED`);
  const matches = data.matches || [];

  // Solo el próximo partido
  return matches.slice(0, 5);
}
