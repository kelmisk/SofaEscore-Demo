export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { slug, ...queryParams } = req.query;
  const path = Array.isArray(slug) ? slug.join('/') : (slug || '');
  const qs = new URLSearchParams(queryParams).toString();
  const url = `https://api.football-data.org/v4/${path}${qs ? '?' + qs : ''}`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_API_KEY || process.env.VITE_FOOTBALL_API_KEY,
      },
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
