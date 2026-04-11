const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'masters2026';
const SUBMIT_CODE    = process.env.SUBMIT_CODE    || 'masters123';
// April 9, 2026 8:00am ET = 12:00pm UTC
const SUBMISSION_DEADLINE = new Date('2026-04-09T12:00:00Z');

// Cache live scores for 60 seconds
let scoreCache = { data: null, timestamp: 0 };
const CACHE_TTL = 60 * 1000;

const DATA_FILE = path.join(__dirname, 'data', 'entries.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Data helpers ──────────────────────────────────────────────────────────────

function loadData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, '')
    .trim();
}

function parseScore(str) {
  if (str === null || str === undefined || str === '' || str === '-') return null;
  if (typeof str === 'number') return str;
  const s = String(str).trim();
  if (s === 'E') return 0;
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n;
}

function formatScore(score) {
  if (score === null || score === undefined) return '-';
  if (score === 0) return 'E';
  return score > 0 ? `+${score}` : `${score}`;
}

// ── Live score fetching ───────────────────────────────────────────────────────

async function fetchLiveScores() {
  const now = Date.now();
  if (scoreCache.data && (now - scoreCache.timestamp) < CACHE_TTL) {
    return scoreCache.data;
  }

  const { par, year } = loadData().settings;

  // Primary: Masters.com official live feed
  try {
    const res = await fetch(
      `https://www.masters.com/en_US/scores/feeds/${year}/scores.json`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 }
    );
    if (res.ok) {
      const json = await res.json();
      const players = parseMastersData(json, par);
      if (players.length > 0) {
        scoreCache = { data: players, timestamp: now };
        console.log(`[scores] Masters.com: ${players.length} players`);
        return players;
      }
    }
  } catch (e) {
    console.warn('[scores] Masters.com failed:', e.message);
  }

  // Fallback: ESPN golf leaderboard
  try {
    const res = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/golf/leaderboard',
      { timeout: 10000 }
    );
    if (res.ok) {
      const json = await res.json();
      const players = parseESPNData(json, par);
      if (players.length > 0) {
        scoreCache = { data: players, timestamp: now };
        console.log(`[scores] ESPN: ${players.length} players`);
        return players;
      }
    }
  } catch (e) {
    console.warn('[scores] ESPN failed:', e.message);
  }

  // Return stale cache rather than nothing
  if (scoreCache.data) {
    console.warn('[scores] Using stale cache');
    return scoreCache.data;
  }

  return [];
}

function parseMastersData(json, par) {
  const players = [];
  const list = json?.data?.player || [];

  // Augusta National hole pars (holes 1–18)
  const holePars = [4,5,4,3,4,3,4,5,4, 4,4,3,5,4,5,3,4,4];

  for (const p of list) {
    const name = `${p.first_name} ${p.last_name}`.trim();
    const status = (p.status || '').toUpperCase();
    // Masters status codes: 'C' = cut, 'W' = withdrawn, 'D' = disqualified
    const missed_cut = ['C','W','D','CUT','WD'].includes(status);

    // rounds 1–4 are objects: { total: <raw strokes or null>, scores: [18 hole scores] }
    function getRoundData(roundObj) {
      if (!roundObj) return { toPar: null, holes: [] };
      const total = roundObj.total != null ? parseInt(roundObj.total, 10) : null;
      const toPar = total !== null ? total - par : null;
      const holes = (roundObj.scores || []).map((s, hi) => {
        if (s === null) return null;
        const strokes = parseInt(s, 10);
        return { hole: hi + 1, strokes, toPar: strokes - holePars[hi] };
      });
      return { toPar, holes, status: roundObj.roundStatus || '' };
    }

    const rd = [
      getRoundData(p.round1),
      getRoundData(p.round2),
      getRoundData(p.round3),
      getRoundData(p.round4)
    ];

    const rounds = rd.map(r => r.toPar);
    const completedRounds = rounds.filter(r => r !== null).length;

    const thru = p.thru || '-';
    const today = parseScore(p.today);

    // If a round is in progress (today score exists, round total not yet posted)
    const inProgress = today !== null && thru !== '' && thru !== 'F';
    if (inProgress && completedRounds < 4) {
      rounds[completedRounds] = today;
    }

    // Total to-par: prefer explicit `topar` field, fall back to summing rounds
    const totalStr = p.topar || p.total || null;
    let total = parseScore(totalStr);
    if (total === null && rounds.some(r => r !== null)) {
      total = rounds.filter(r => r !== null).reduce((s, v) => s + v, 0);
    }

    players.push({
      name,
      nameNorm: normalizeName(name),
      position: p.pos || '-',
      missed_cut,
      rounds,
      holeByHole: rd.map(r => r.holes),
      total,
      today,
      thru,
      status: p.status || '',
      completedRounds
    });
  }

  return players;
}

function parseESPNData(json, par) {
  const players = [];
  const events = json?.events || [];

  for (const event of events) {
    for (const comp of (event.competitions || [])) {
      for (const c of (comp.competitors || [])) {
        const name = c.athlete?.displayName || '';
        const statusName = c.status?.type?.name || '';
        const missed_cut = statusName === 'STATUS_MISSED_CUT' || statusName === 'STATUS_WITHDRAWN';

        const linescores = c.linescores || [];
        const rounds = linescores.slice(0, 4).map(ls => parseScore(ls.displayValue));
        while (rounds.length < 4) rounds.push(null);

        const thru = c.status?.displayValue || '-';
        const total = parseScore(c.score);
        const completedRounds = rounds.filter(r => r !== null).length;

        players.push({
          name,
          nameNorm: normalizeName(name),
          position: c.status?.position?.displayName || '-',
          missed_cut,
          rounds,
          total,
          thru,
          status: missed_cut ? 'cut' : 'active',
          completedRounds
        });
      }
    }
  }

  return players;
}

// ── Scoring logic ─────────────────────────────────────────────────────────────

function findGolfer(players, pickName) {
  const norm = normalizeName(pickName);
  return (
    players.find(p => p.nameNorm === norm) ||
    players.find(p => p.nameNorm.includes(norm) || norm.includes(p.nameNorm))
  );
}

// Average of the N worst round scores from non-missed-cut players
function autoPenalty(liveScores, roundIdx, n = 10) {
  const scores = liveScores
    .filter(p => !p.missed_cut && p.rounds[roundIdx] !== null)
    .map(p => p.rounds[roundIdx])
    .sort((a, b) => b - a); // worst first

  if (scores.length === 0) return null;
  const sample = scores.slice(0, Math.min(n, scores.length));
  return Math.round(sample.reduce((s, v) => s + v, 0) / sample.length);
}

function calculateLeaderboard(participants, liveScores, manualPenalty) {
  // Resolve penalty scores for rounds 3 & 4
  const penalties = {
    round3: manualPenalty?.round3 ?? autoPenalty(liveScores, 2),
    round4: manualPenalty?.round4 ?? autoPenalty(liveScores, 3)
  };

  const results = participants.map(participant => {
    // Attach live data to each pick
    const golfers = participant.picks.map(pickName => {
      const live = findGolfer(liveScores, pickName);
      return {
        name: pickName,
        live: live || null,
        missed_cut: live?.missed_cut || false,
        position: live?.position || '-',
        thru: live?.thru || '-',
        rounds: live ? [...live.rounds] : [null, null, null, null],
        total: live?.total ?? null
      };
    });

    // Apply missed-cut penalty to rounds 3 & 4
    const effectiveRounds = golfers.map(g => {
      const r = [...g.rounds];
      if (g.missed_cut) {
        if (r[2] === null && penalties.round3 !== null) r[2] = penalties.round3;
        if (r[3] === null && penalties.round4 !== null) r[3] = penalties.round4;
      }
      return r;
    });

    // Per-round team score: sum of all golfer scores - worst (drop 1 per round)
    const roundScores = [];
    const droppedEach = [];

    for (let ri = 0; ri < 4; ri++) {
      const vals = effectiveRounds
        .map((r, gi) => ({ score: r[ri], name: golfers[gi].name }))
        .filter(x => x.score !== null);

      if (vals.length === 0) {
        roundScores.push(null);
        droppedEach.push(null);
        continue;
      }

      if (vals.length === 1) {
        roundScores.push(vals[0].score);
        droppedEach.push(null);
        continue;
      }

      const worst = vals.reduce((a, b) => (a.score >= b.score ? a : b));
      const team = vals.reduce((sum, x) => sum + x.score, 0) - worst.score;
      roundScores.push(team);
      droppedEach.push(worst.name);
    }

    const total = roundScores.filter(s => s !== null).reduce((sum, s) => sum + s, 0);
    const roundsWithData = roundScores.filter(s => s !== null).length;

    return {
      id: participant.id,
      name: participant.name,
      paid: participant.paid,
      picks: participant.picks,
      golfers,
      roundScores,
      droppedEach,
      total,
      roundsWithData,
      penalties
    };
  });

  // Sort: lowest total first; if tied, sort by name
  results.sort((a, b) => {
    if (a.roundsWithData === 0 && b.roundsWithData === 0) return a.name.localeCompare(b.name);
    if (a.roundsWithData === 0) return 1;
    if (b.roundsWithData === 0) return -1;
    if (a.total !== b.total) return a.total - b.total;
    return a.name.localeCompare(b.name);
  });

  // Assign positions (with ties)
  let pos = 1;
  for (let i = 0; i < results.length; i++) {
    if (i > 0 && results[i].total === results[i - 1].total && results[i].roundsWithData > 0) {
      results[i].position = results[i - 1].position;
    } else {
      results[i].position = results[i].roundsWithData > 0 ? pos : '-';
    }
    pos++;
  }

  return results;
}

function calculatePayouts(numPlayers, buyIn) {
  const pool = numPlayers * buyIn;
  if (numPlayers <= 1) return [{ place: 1, label: '1st', amount: pool }];
  if (numPlayers <= 3) return [
    { place: 1, label: '1st', amount: pool - buyIn },
    { place: 2, label: '2nd', amount: buyIn }
  ];
  return [
    { place: 1, label: '1st', amount: buyIn * (numPlayers - 4) },
    { place: 2, label: '2nd', amount: buyIn * 3 },
    { place: 3, label: '3rd', amount: buyIn }
  ];
}

// ── API Routes ────────────────────────────────────────────────────────────────

// Leaderboard (main page data)
app.get('/api/leaderboard', async (req, res) => {
  try {
    const data = loadData();
    const liveScores = await fetchLiveScores();
    const leaderboard = calculateLeaderboard(data.participants, liveScores, data.penaltyScores);
    const payouts = calculatePayouts(data.participants.length, data.settings.buyIn);

    res.json({
      leaderboard,
      payouts,
      totalPool: data.participants.length * data.settings.buyIn,
      settings: data.settings,
      lastUpdated: scoreCache.timestamp ? new Date(scoreCache.timestamp).toISOString() : null,
      penalties: {
        round3: data.penaltyScores?.round3 ?? autoPenalty(liveScores, 2),
        round4: data.penaltyScores?.round4 ?? autoPenalty(liveScores, 3)
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Raw golfer scores (for admin / debugging)
app.get('/api/scores', async (req, res) => {
  try {
    const scores = await fetchLiveScores();
    res.json({ scores, lastUpdated: new Date(scoreCache.timestamp).toISOString() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Tiers definition
app.get('/api/tiers', (req, res) => {
  try {
    const data = loadData();
    res.json(data.tiers);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// All participants (public names only)
app.get('/api/entries', (req, res) => {
  try {
    const data = loadData();
    res.json(data.participants);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Add participant
app.post('/api/entries', (req, res) => {
  const { password, name, picks, paid } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Invalid password' });
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });
  if (!picks || picks.length < 4) return res.status(400).json({ error: 'At least 4 picks required (Tiers 1–4)' });

  const data = loadData();

  if (data.participants.find(p => p.name.toLowerCase() === name.trim().toLowerCase())) {
    return res.status(400).json({ error: 'A participant with that name already exists' });
  }

  const id = `${name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`;
  const participant = { id, name: name.trim(), paid: !!paid, picks };
  data.participants.push(participant);
  saveData(data);

  res.json(participant);
});

// Update participant
app.put('/api/entries/:id', (req, res) => {
  const { password, name, picks, paid } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Invalid password' });

  const data = loadData();
  const idx = data.participants.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Participant not found' });

  data.participants[idx] = {
    ...data.participants[idx],
    ...(name !== undefined && { name: name.trim() }),
    ...(picks !== undefined && { picks }),
    ...(paid !== undefined && { paid: !!paid })
  };
  saveData(data);

  res.json(data.participants[idx]);
});

// Delete participant
app.delete('/api/entries/:id', (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Invalid password' });

  const data = loadData();
  const idx = data.participants.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Participant not found' });

  data.participants.splice(idx, 1);
  saveData(data);
  res.json({ success: true });
});

// Public pick submission
app.post('/api/submit', (req, res) => {
  const { code, name, picks } = req.body;
  if (code !== SUBMIT_CODE) return res.status(401).json({ error: 'Invalid access code' });

  const data = loadData();

  if (data.settings.locked || Date.now() >= SUBMISSION_DEADLINE) {
    return res.status(403).json({ error: 'Submissions are closed. The tournament has started.' });
  }

  if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });
  if (!picks || picks.length < 4) return res.status(400).json({ error: 'Picks for Tiers 1–4 are required' });

  // Validate each pick exists in the correct tier
  const tierKeys = ['tier1', 'tier2', 'tier3', 'tier4', 'tier5'];
  for (let i = 0; i < 4; i++) {
    const tierGolfers = (data.tiers[tierKeys[i]] || []).map(g => g.name);
    if (!tierGolfers.includes(picks[i])) {
      return res.status(400).json({ error: `"${picks[i]}" is not a valid Tier ${i + 1} pick` });
    }
  }
  if (picks[4]) {
    const tier5Golfers = (data.tiers.tier5 || []).map(g => g.name);
    if (!tier5Golfers.includes(picks[4])) {
      return res.status(400).json({ error: `"${picks[4]}" is not a valid Tier 5 pick` });
    }
  }

  if (data.participants.find(p => p.name.toLowerCase() === name.trim().toLowerCase())) {
    return res.status(400).json({ error: 'That name is already taken. Contact the admin if you need to make changes.' });
  }

  const id = `${name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`;
  const participant = { id, name: name.trim(), paid: false, picks };
  data.participants.push(participant);
  saveData(data);

  res.json(participant);
});

// Update settings (penalty scores, buy-in, locked, etc.)
app.post('/api/settings', (req, res) => {
  const { password, penaltyScores, buyIn, locked } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Invalid password' });

  const data = loadData();
  if (penaltyScores !== undefined) data.penaltyScores = penaltyScores;
  if (buyIn !== undefined) data.settings.buyIn = Number(buyIn);
  if (locked !== undefined) data.settings.locked = !!locked;
  saveData(data);

  res.json({ success: true });
});

// Force refresh live score cache
app.post('/api/refresh', async (req, res) => {
  scoreCache.timestamp = 0;
  try {
    await fetchLiveScores();
    res.json({ success: true, lastUpdated: new Date(scoreCache.timestamp).toISOString() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Masters Pool running on http://localhost:${PORT}`);
});
