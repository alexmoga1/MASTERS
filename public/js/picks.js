/* ── Picks submission page ───────────────────────────────────────────────────── */

let accessCode = '';
let tiers = null;
let buyInAmount = 7;

// April 9, 2026 8:00am ET = 12:00pm UTC
const SUBMISSION_DEADLINE = new Date('2026-04-09T12:00:00Z');

// ── Access code gate ──────────────────────────────────────────────────────────

function unlock() {
  const code = document.getElementById('codeInput').value.trim();
  if (!code) return;

  accessCode = code;

  // Check server status (locked?) and load tiers
  Promise.all([
    fetch('/api/tiers').then(r => r.json()),
    fetch('/api/leaderboard').then(r => r.json())
  ]).then(([tiersData, lbData]) => {
    tiers = tiersData;
    buyInAmount = lbData.settings?.buyIn ?? 7;

    // Show the panel
    document.getElementById('codeGate').style.display = 'none';
    document.getElementById('picksPanel').style.display = 'block';
    document.getElementById('buyIn').textContent = buyInAmount;

    if (lbData.settings?.locked || Date.now() >= SUBMISSION_DEADLINE) {
      document.getElementById('formSection').style.display = 'none';
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
