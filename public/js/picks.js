/* ── Picks submission page ───────────────────────────────────────────────────── */

let accessCode = '';
let tiers = null;
let buyInAmount = 7;

// April 9, 2026 8:00am ET = 12:00pm UTC
const SUBMISSION_DEADLINE = new Date('2026-04-09T12:00:00Z');

// ── Golfer hype messages ──────────────────────────────────────────────────────
// Each entry: { icon, title, msg }

const GOLFER_HYPE = {
  // Tier 1
  'Scottie Scheffler': {
    icon: '🟢',
    title: 'Boring Choice. Genius Choice.',
    msg: 'World No. 1. Won the Masters in 2022 and 2024. Picks Scheffler, wins money — it\'s almost unfair.'
  },
  'Jon Rahm': {
    icon: '🔥',
    title: 'El Rahmbo Rises',
    msg: 'Two-time major champion with a chip on his shoulder. Augusta suits his ball-striking like a glove.'
  },
  'Bryson DeChambeau': {
    icon: '💪',
    title: 'Big Brain, Bigger Drive',
    msg: 'The mad scientist of golf. He doesn\'t play Augusta — he solves it. Bold pick, and we respect it.'
  },
  'Rory McIlroy': {
    icon: '🍀',
    title: 'The Man Who Wants It Most',
    msg: 'The career Grand Slam is all that\'s left. One day it\'ll happen at Augusta. Maybe this is that day.'
  },
  'Ludvig Aberg': {
    icon: '⚡',
    title: 'The Viking Cometh',
    msg: 'Runner-up in his Masters debut. He\'s only gotten better since. Dangerous pick — in a great way.'
  },
  'Xander Schauffele': {
    icon: '🏆',
    title: 'The Clutch Factor',
    msg: 'Reigning Open and PGA champion. Xander doesn\'t crack under pressure — he thrives on it.'
  },

  // Tier 2
  'Cam Young': {
    icon: '🌟',
    title: 'Young Gun Alert',
    msg: 'Elite ball-striker who loves a big stage. Flying under the radar — which is exactly when he\'s dangerous.'
  },
  'Tommy Fleetwood': {
    icon: '🎯',
    title: 'The English Assassin',
    msg: 'Gorgeous iron play, ice in his veins. Augusta National was made for a player like Tommy Fleetwood.'
  },
  'Matt Fitzpatrick': {
    icon: '🧠',
    title: 'The Shot-Maker',
    msg: 'US Open champion and course-management wizard. He won\'t beat you long — he\'ll beat you smart.'
  },
  'Hideki Matsuyama': {
    icon: '🌸',
    title: 'The Defending Spirit',
    msg: '2021 Masters champion and Augusta royalty. He has a bond with this course that goes beyond golf.'
  },
  'Collin Morikawa': {
    icon: '📐',
    title: 'Machine Mode Activated',
    msg: 'Two major wins and the most precise ball-striker in the game. When Morikawa is on, he\'s untouchable.'
  },
  'Robert MacIntyre': {
    icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    title: 'The Scottish Underdog',
    msg: 'Left-hander with a massive heart and a game to match. He\'ll be the story of the week — count on it.'
  },

  // Tier 3
  'Min Woo Lee': {
    icon: '🎪',
    title: 'Most Entertaining Pick in the Pool',
    msg: 'Fearless, flashy, and fun to watch. Min Woo plays like he has nothing to lose — and that\'s terrifying for the field.'
  },
  'Justin Rose': {
    icon: '🌹',
    title: 'Augusta Veteran, Still Dangerous',
    msg: '2013 US Open champion who knows every blade of grass at Augusta. Never count out the Rose.'
  },
  'Brooks Koepka': {
    icon: '😤',
    title: 'Major Mode: Engaged',
    msg: 'Five majors. Shows up every time the trophy matters most. If you want ice-cold clutch, you picked right.'
  },
  'Chris Gotterup': {
    icon: '🚀',
    title: 'Sleeper Pick of the Year',
    msg: 'Big hitter, big game, and nobody\'s talking about him. The best picks are the ones nobody sees coming.'
  },
  'Jordan Spieth': {
    icon: '🎩',
    title: 'Augusta\'s Forever Darling',
    msg: '2015 Masters champion who has never stopped loving this place. Spieth and Augusta is a love story with no ending.'
  },
  'Patrick Reed': {
    icon: '🫡',
    title: 'Captain America Reporting',
    msg: '2018 Masters champion. He\'s polarizing, sure — but he knows exactly what it takes to win here.'
  },

  // Tier 4
  'Viktor Hovland': {
    icon: '🇳🇴',
    title: 'Norwegian Wood',
    msg: 'Former world No. 1 who plays with joy and freedom. When Hovland is clicking, he\'s a top-5 player on the planet.'
  },
  'Russell Henley': {
    icon: '🎯',
    title: 'The Quiet Contender',
    msg: 'Consistent, precise, and wildly underrated. Henley quietly puts up great Masters results — now the secret\'s out.'
  },
  'Si Woo Kim': {
    icon: '✨',
    title: 'Wild Card Energy',
    msg: 'Won the Players Championship and has won in styles nobody else would even attempt. Expect the unexpected.'
  },
  'Justin Thomas': {
    icon: '💥',
    title: 'JT Is Back',
    msg: 'Two major wins and a burning desire to prove himself again. When Thomas gets hot, nobody can touch him.'
  },
  'Akshay Bhatia': {
    icon: '🌊',
    title: 'The New Wave',
    msg: 'Young, fearless, and trending upward fast. This might be the year Augusta introduces itself to Akshay Bhatia.'
  },
  'Patrick Cantlay': {
    icon: '🧊',
    title: 'Iceman Cometh',
    msg: 'Stone cold under pressure with the putting stroke of a legend. Cantlay never beats himself — he just wins.'
  },

  // Tier 5
  'Sam Burns': {
    icon: '🔥',
    title: 'Local Favorite with Fire',
    msg: 'Louisiana native with PGA Tour pedigree and Augusta in his blood. A sleeper who hits it a mile.'
  },
  'Maverick McNealy': {
    icon: '🛩️',
    title: 'High-Flying Dark Horse',
    msg: 'Stanford grad, long hitter, and one of the most improved players on Tour. McNealy is coming for this field.'
  },
  'Corey Conners': {
    icon: '🍁',
    title: 'The Canadian Cannonball',
    msg: 'One of the most accurate drivers on Tour. He doesn\'t make mistakes — and Augusta punishes mistakes mercilessly.'
  },
  'Tiger Woods': {
    icon: '🐅',
    title: 'You Picked Tiger.',
    msg: 'Five green jackets. Fifteen majors. A comeback story that has no right to keep working — and yet. You picked right.'
  },
  'Daniel Berger': {
    icon: '⚡',
    title: 'The Longshot with Upside',
    msg: 'Power game, great short game, and a huge motivation to re-establish himself on the biggest stage in golf.'
  },
  'JJ Spaun': {
    icon: '🎲',
    title: 'All In on the Longshot',
    msg: 'Absolute long-shot pick and we are HERE for it. If Spaun goes low this week, you\'ll be the most popular person in the pool.'
  }
};

// ── Access code gate ──────────────────────────────────────────────────────────

function unlock() {
  const code = document.getElementById('codeInput').value.trim();
  if (!code) return;

  accessCode = code;

  Promise.all([
    fetch('/api/tiers').then(r => r.json()),
    fetch('/api/leaderboard').then(r => r.json())
  ]).then(([tiersData, lbData]) => {
    tiers = tiersData;
    buyInAmount = lbData.settings?.buyIn ?? 7;

    document.getElementById('codeGate').style.display = 'none';
    document.getElementById('picksPanel').style.display = 'block';
    document.getElementById('buyIn').textContent = buyInAmount;
    document.getElementById('buyInInstr').textContent = buyInAmount;

    if (lbData.settings?.locked || Date.now() >= SUBMISSION_DEADLINE) {
      document.getElementById('formSection').style.display = 'none';
      document.getElementById('howItWorks').style.display = 'none';
      document.getElementById('lockedMsg').style.display = 'block';
    } else {
      populateTiers();
    }
  }).catch(() => {
    document.getElementById('codeErr').textContent = 'Connection error. Please try again.';
  });
}

// ── Populate tier dropdowns ───────────────────────────────────────────────────

function populateTiers() {
  if (!tiers) return;

  for (let t = 1; t <= 4; t++) {
    const sel = document.getElementById(`pTier${t}`);
    sel.innerHTML = '<option value="">Select golfer…</option>';
    (tiers[`tier${t}`] || []).forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.name;
      opt.textContent = `${g.name} (+${g.odds})`;
      sel.appendChild(opt);
    });
  }

  const sel5 = document.getElementById('pTier5');
  sel5.innerHTML = '<option value="">No Tier 5 pick</option>';
  (tiers.tier5 || []).forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.name;
    opt.textContent = `${g.name} (+${g.odds})`;
    sel5.appendChild(opt);
  });
}

// ── Submit ────────────────────────────────────────────────────────────────────

async function submitPicks(e) {
  e.preventDefault();

  const name = document.getElementById('pName').value.trim();
  const picks = [];

  for (let t = 1; t <= 4; t++) {
    const val = document.getElementById(`pTier${t}`).value;
    if (!val) {
      document.getElementById('picksErr').textContent = `Please select a Tier ${t} pick.`;
      return;
    }
    picks.push(val);
  }

  const tier5 = document.getElementById('pTier5').value;
  if (tier5) picks.push(tier5);

  document.getElementById('picksErr').textContent = '';
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'Submitting…';

  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: accessCode, name, picks })
    });

    const result = await res.json();

    if (!res.ok) {
      document.getElementById('picksErr').textContent = result.error || 'Error submitting picks.';
      btn.disabled = false;
      btn.textContent = 'Submit My Picks';
      return;
    }

    showConfirmation(name, picks);
    maybeShowHype(picks);
  } catch (err) {
    document.getElementById('picksErr').textContent = 'Network error. Please try again.';
    btn.disabled = false;
    btn.textContent = 'Submit My Picks';
  }
}

// ── Confirmation ──────────────────────────────────────────────────────────────

function showConfirmation(name, picks) {
  document.getElementById('picksPanel').style.display = 'none';
  document.getElementById('confirmPanel').style.display = 'block';
  document.getElementById('confirmName').textContent = name;
  document.getElementById('confirmBuyIn').textContent = buyInAmount;

  const tierLabels = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5'];
  const container = document.getElementById('confirmPicks');
  container.innerHTML = picks.map((pick, i) => `
    <div class="golfer-card">
      <div style="font-size:0.7rem;color:var(--green);font-weight:700;letter-spacing:0.5px;margin-bottom:4px;text-transform:uppercase">${tierLabels[i]}</div>
      <div class="golfer-name">${pick}</div>
    </div>
  `).join('');
}

// ── Hype modal (1-in-3 chance) ────────────────────────────────────────────────

function maybeShowHype(picks) {
  if (Math.random() > 1 / 3) return;

  // Pick a random golfer from their selections to hype
  const candidate = picks[Math.floor(Math.random() * picks.length)];
  const hype = GOLFER_HYPE[candidate];
  if (!hype) return;

  document.getElementById('hypeIcon').textContent = hype.icon;
  document.getElementById('hypeTitle').textContent = hype.title;
  document.getElementById('hypeMsg').textContent = hype.msg;
  document.getElementById('hypeOverlay').style.display = 'flex';
}

function closeHype() {
  document.getElementById('hypeOverlay').style.display = 'none';
}
