export default async function handler(req, res) {
  const path = req.query.path || '';
  const url = `https://api.football-data.org/v4/${path}`;

  const queryString = new URLSearchParams(req.query);
  queryString.delete('path');
  const fullUrl = queryString.toString() ? `${url}?${queryString}` : url;

  try {
    const response = await fetch(fullUrl, {
      headers: {
        'X-Auth-Token': process.env.VITE_FOOTBALL_API_KEY,
      },
    });

    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
