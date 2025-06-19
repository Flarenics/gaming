const { HttpsProxyAgent } = require('https-proxy-agent');
const express = require('express');
const path = require('path');

const agent = process.env.https_proxy ? new HttpsProxyAgent(process.env.https_proxy) : undefined;
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const API_BASE = 'https://api.quavergame.com/v2';

const rateFlags = new Map([
  [1n<<1n, 0.5],
  [1n<<2n, 0.6],
  [1n<<3n, 0.7],
  [1n<<4n, 0.8],
  [1n<<5n, 0.9],
  [1n<<6n, 1.1],
  [1n<<7n, 1.2],
  [1n<<8n, 1.3],
  [1n<<9n, 1.4],
  [1n<<10n, 1.5],
  [1n<<11n, 1.6],
  [1n<<12n, 1.7],
  [1n<<13n, 1.8],
  [1n<<14n, 1.9],
  [1n<<15n, 2.0],
  [1n<<24n, 0.55],
  [1n<<25n, 0.65],
  [1n<<26n, 0.75],
  [1n<<27n, 0.85],
  [1n<<28n, 0.95],
  [1n<<33n, 1.05],
  [1n<<34n, 1.15],
  [1n<<35n, 1.25],
  [1n<<36n, 1.35],
  [1n<<37n, 1.45],
  [1n<<38n, 1.55],
  [1n<<39n, 1.65],
  [1n<<40n, 1.75],
  [1n<<41n, 1.85],
  [1n<<42n, 1.95]
]);

function getRate(modifiers) {
  const val = BigInt(modifiers);
  for (const [flag, rate] of rateFlags) {
    if (val & flag) return rate;
  }
  return 1.0;
}

const { execFile } = require("child_process");
async function proxiedFetch(url) {
  return new Promise((res, rej) => {
    execFile("curl", ["-s", url], (err, stdout, stderr) => {
      if (err) return rej(err);
      res({ ok: true, json: async () => JSON.parse(stdout) });
    });
  });
}

app.get('/api/user/:name', async (req, res) => {
  try {
    const resp = await proxiedFetch(`${API_BASE}/user/search/${encodeURIComponent(req.params.name)}`);
    const data = await resp.json();
    if (data.users && data.users.length > 0) {
      res.json(data.users[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.get('/api/user/:id/scores', async (req, res) => {
  const { sort = 'combo', grade, rate = 'any', mode = 2 } = req.query;
  try {
    const resp = await proxiedFetch(`${API_BASE}/user/${req.params.id}/scores/${mode}/best`);
    const json = await resp.json();
    let scores = json.scores || [];
    scores = scores.map(s => ({ ...s, rate: getRate(s.modifiers) }));
    if (grade) {
      scores = scores.filter(s => s.grade === grade);
    }
    if (rate !== 'any') {
      const target = parseFloat(rate);
      scores = scores.filter(s => s.rate === target);
    }
    if (sort === 'performance') {
      scores.sort((a, b) => b.performance_rating - a.performance_rating);
    } else {
      scores.sort((a, b) => b.max_combo - a.max_combo);
    }
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
