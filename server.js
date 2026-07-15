const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'open2026';
const SUBMIT_CODE    = process.env.SUBMIT_CODE    || 'open123';
// The Open 2026 first tee — July 16, 2026 6:35am BST = 5:35am UTC
const SUBMISSION_DEADLINE = new Date('2026-07-16T05:35:00Z');

// Cache live scores for 60 seconds
let scoreCache = { data: null, timestamp: 0 };
const CACHE_TTL = 60 * 1000;

// Whether the most recent parse found an event actually matching the configured
// tournamentName (vs. falling back to unrelated live events). Gates auto-archive
// so we never freeze the wrong tournament's leaderboard.
let scoresMatchedTournament = false;

// DATA_DIR lets Railway (or any host) point the live data file at a persistent
// volume — e.g. DATA_DIR=/data mounted as a Railway Volume. Falls back to the
// repo's ./data for local dev. The live file is NOT tracked in git; on first
// boot (fresh volume) it is seeded from the committed entries.seed.json.
const DATA_DIR  = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'entries.json');
const SEED_FILE = path.join(__dirname, 'data', 'entries.seed.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Data helpers ──────────────────────────────────────────────────────────────

// Create the data directory and seed the live file if it doesn't exist yet.
// Safe to call repeatedly — it only writes when the file is missing, so it
// never clobbers data already living on the volume.
function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) {
      const seed = fs.existsSync(SEED_FILE)
        ? fs.readFileSync(SEED_FILE, 'utf8')
        : JSON.stringify({ participants: [], tiers: {}, settings: {}, archives: [] }, null, 2);
      fs.writeFileSync(DATA_FILE, seed);
      console.log(`[data] Seeded ${DATA_FILE}${fs.existsSync(SEED_FILE) ? ' from entries.seed.json' : ' (empty template)'}`);
    }
  } catch (e) {
    console.error('[data] ensureDataFile failed:', e.message);
  }
}

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

  const { tournamentName } = loadData().settings;

  // ESPN golf leaderboard — the live source for The Open.
  try {
    const res = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/golf/leaderboard',
      { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 }
    );
    if (res.ok) {
      const json = await res.json();
      const players = parseESPNData(json, tournamentName);
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

function parseESPNData(json, tournamentName) {
  const players = [];
  let events = json?.events || [];

  // If a tournament is configured, only read events that match it — so a
  // concurrent tour event (or a stale/next event) can never poison the pool.
  if (tournamentName) {
    const want = tournamentName.toLowerCase();
    const matched = events.filter(e =>
      (e.name || '').toLowerCase().includes(want) ||
      (e.shortName || '').toLowerCase().includes(want)
    );
    scoresMatchedTournament = matched.length > 0;
    if (matched.length) events = matched;
  } else {
    scoresMatchedTournament = false; // no configured tournament → never auto-archive
  }

  for (const event of events) {
    for (const comp of (event.competitions || [])) {
      for (const c of (comp.competitors || [])) {
        const name = c.athlete?.displayName || '';
        if (!name) continue;

        // Cut detection is robust to ESPN's various status spellings.
        const typeName = (c.status?.type?.name || '').toUpperCase();
        const detail = (c.status?.type?.description || c.status?.displayValue || '').toUpperCase();
        const missed_cut =
          /CUT|WITHDRAW|DISQUALIF/.test(typeName) ||
          /\b(CUT|WD|MC|DQ)\b/.test(detail);

        // Per-round linescores: displayValue is already to-par ("-4", "E", "+2")
        const linescores = c.linescores || [];
        const rounds = linescores.slice(0, 4).map(ls => parseScore(ls.displayValue));
        while (rounds.length < 4) rounds.push(null);

        const state = c.status?.type?.state; // 'pre' | 'in' | 'post'
        const thru = state === 'pre' ? '-' : (c.status?.displayValue || '-');

        // `score` may be a plain string ("-5") or an object ({ value, displayValue })
        const rawScore = (c.score && typeof c.score === 'object') ? c.score.displayValue : c.score;
        const total = parseScore(rawScore);
        const completedRounds = rounds.filter(r => r !== null).length;

        players.push({
          name,
          nameNorm: normalizeName(name),
          position: c.status?.position?.displayName || '-',
          missed_cut,
          rounds,
          total,
          thru,
          state, // 'pre' | 'in' | 'post' — used to detect a finished tournament
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

    // Apply missed-cut penalty to rounds 3 & 4.
    // A cut golfer doesn't play the weekend, so their R3/R4 score is REPLACED by
    // the penalty (overriding any stray/placeholder value from the feed) so the
    // missing rounds count against the team. The drop-worst rule still applies.
    const effectiveRounds = golfers.map(g => {
      const r = [...g.rounds];
      if (g.missed_cut) {
        if (penalties.round3 !== null) r[2] = penalties.round3;
        if (penalties.round4 !== null) r[3] = penalties.round4;
      }
      return r;
    });

    // Surface the penalty-adjusted rounds to the UI so a cut golfer's R3/R4
    // actually display the "CUT PEN" score instead of looking blank.
    golfers.forEach((g, gi) => { g.rounds = effectiveRounds[gi]; });

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

// ── Tournament archiving ────────────────────────────────────────────────────

// A tournament is "complete" once every player who made the cut has finished
// (ESPN marks their state 'post'). Cut/WD/DQ players are excluded from the check.
function isTournamentComplete(liveScores) {
  const active = liveScores.filter(p => !p.missed_cut);
  return liveScores.length > 0 && active.length > 0 && active.every(p => p.state === 'post');
}

function archiveId(settings) {
  return `${settings.year || 'tournament'}-${normalizeName(settings.tournamentName || 'event').replace(/\s+/g, '-')}`;
}

// Build a frozen snapshot of the finished tournament: final standings, payouts
// and metadata. Stored verbatim so it renders identically after ESPN drops the
// event from its live feed.
function buildArchive(data, leaderboard, liveScores) {
  const s = data.settings || {};
  return {
    id: archiveId(s),
    tournamentName: s.tournamentName || 'Tournament',
    year: s.year || null,
    course: s.course || null,
    buyIn: s.buyIn || 0,
    totalPool: data.participants.length * (s.buyIn || 0),
    payouts: calculatePayouts(data.participants.length, s.buyIn || 0),
    penalties: {
      round3: data.penaltyScores?.round3 ?? autoPenalty(liveScores, 2),
      round4: data.penaltyScores?.round4 ?? autoPenalty(liveScores, 3)
    },
    archivedAt: new Date().toISOString(),
    leaderboard
  };
}

// Auto-archive once, when the tournament finishes. Idempotent: skips if an
// archive already exists for this tournament + year. Returns true if it wrote.
function maybeAutoArchive(data, leaderboard, liveScores) {
  // Only auto-archive when the live feed actually matched the configured
  // tournament — never freeze an unrelated event that slipped in via fallback.
  if (!scoresMatchedTournament) return false;
  if (!isTournamentComplete(liveScores)) return false;
  if (!Array.isArray(data.archives)) data.archives = [];
  const id = archiveId(data.settings || {});
  if (data.archives.some(a => a.id === id)) return false;

  data.archives.push(buildArchive(data, leaderboard, liveScores));
  saveData(data);
  console.log(`[archive] Auto-archived ${id}`);
  return true;
}

// ── API Routes ────────────────────────────────────────────────────────────────

// Leaderboard (main page data)
app.get('/api/leaderboard', async (req, res) => {
  try {
    const data = loadData();
    const liveScores = await fetchLiveScores();
    const leaderboard = calculateLeaderboard(data.participants, liveScores, data.penaltyScores);
    const payouts = calculatePayouts(data.participants.length, data.settings.buyIn);

    // Freeze the standings the moment the tournament finishes (runs once).
    maybeAutoArchive(data, leaderboard, liveScores);

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

// Archived tournaments — list (metadata + winner only, lightweight)
app.get('/api/archives', (req, res) => {
  try {
    const data = loadData();
    const archives = (data.archives || [])
      .map(a => ({
        id: a.id,
        tournamentName: a.tournamentName,
        year: a.year,
        course: a.course,
        totalPool: a.totalPool,
        archivedAt: a.archivedAt,
        winner: a.leaderboard?.[0]?.name || null,
        entrants: a.leaderboard?.length || 0
      }))
      .sort((a, b) => (b.year || 0) - (a.year || 0));
    res.json(archives);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Archived tournament — full frozen leaderboard
app.get('/api/archives/:id', (req, res) => {
  try {
    const data = loadData();
    const archive = (data.archives || []).find(a => a.id === req.params.id);
    if (!archive) return res.status(404).json({ error: 'Archive not found' });
    res.json(archive);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Manual snapshot — archive the current standings now (admin fallback in case
// auto-detection misses, or to re-freeze a correction). Upserts by archive id.
app.post('/api/admin/archive', async (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Invalid password' });

  try {
    const data = loadData();
    const liveScores = await fetchLiveScores();
    const leaderboard = calculateLeaderboard(data.participants, liveScores, data.penaltyScores);
    const archive = buildArchive(data, leaderboard, liveScores);

    if (!Array.isArray(data.archives)) data.archives = [];
    const idx = data.archives.findIndex(a => a.id === archive.id);
    if (idx === -1) data.archives.push(archive);
    else data.archives[idx] = archive; // overwrite an existing snapshot

    saveData(data);
    res.json({ success: true, archive: { id: archive.id, entrants: leaderboard.length, winner: leaderboard[0]?.name || null } });
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

if (require.main === module) {
  ensureDataFile();
  app.listen(PORT, () => {
    console.log(`The Open Pool running on http://localhost:${PORT}`);
  });
}

module.exports = { calculateLeaderboard, parseESPNData, autoPenalty, findGolfer, normalizeName, isTournamentComplete, buildArchive };
