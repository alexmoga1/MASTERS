/* ── Leaderboard app ─────────────────────────────────────────────────────────── */

const REFRESH_INTERVAL = 60; // seconds
let countdown = REFRESH_INTERVAL;
let timer = null;
let expandedIds = new Set();

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(score) {
  if (score === null || score === undefined) return '-';
  if (score === 0) return 'E';
  return score > 0 ? `+${score}` : `${score}`;
}

function scoreClass(score) {
  if (score === null || score === undefined) return 'score-dash';
  if (score < 0) return 'score-under';
  if (score === 0) return 'score-even';
  return 'score-over';
}

function posLabel(pos, idx) {
  if (pos === '-') return '-';
  // Check tie: if this position equals previous
  return pos;
}

function timeSince(isoStr) {
  if (!isoStr) return 'never';
  const diff = Math.floor((Date.now() - new Date(isoStr)) / 1000);
  if (diff < 5)  return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  return `${Math.floor(diff/3600)}h ago`;
}

// ── Render ───────────────────────────────────────────────────────────────────

function renderPrizes(data) {
  const { payouts, totalPool, settings } = data;
  document.getElementById('buyIn').textContent = settings.buyIn;

  const set = (id, label, amt) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = `<div class="place">${label}</div><div class="amount">$${amt}</div>`;
  };

  if (payouts[0]) set('prize1st', '🥇 1st Place', payouts[0].amount);
  if (payouts[1]) set('prize2nd', '🥈 2nd Place', payouts[1].amount);
  if (payouts[2]) set('prize3rd', '🥉 3rd Place', payouts[2].amount);
  document.getElementById('prizePool').innerHTML =
    `<div class="place">PRIZE POOL</div><div class="amount">$${totalPool}</div>`;
}

function posClass(pos) {
  if (pos === 1) return 'pos-1';
  if (pos === 2) return 'pos-2';
  if (pos === 3) return 'pos-3';
  return 'pos-other';
}

function renderLeaderboard(data) {
  const tbody = document.getElementById('lbBody');
  const { leaderboard } = data;

  if (!leaderboard || leaderboard.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="loading-cell">No participants found.</td></tr>';
    return;
  }

  const rows = [];

  leaderboard.forEach((p, idx) => {
    const isExpanded = expandedIds.has(p.id);
    const tied = idx > 0 && leaderboard[idx-1].position === p.position && p.position !== '-';
    const posDisplay = p.position === '-' ? '-' : (tied ? `T${p.position}` : p.position);
    const isTop3 = typeof p.position === 'number' && p.position <= 3;

    // Main row
    const mainRow = document.createElement('tr');
    mainRow.className = `main-row${p.position === 1 ? ' rank-1' : ''}`;
    mainRow.dataset.id = p.id;
    mainRow.setAttribute('aria-expanded', isExpanded);

    mainRow.innerHTML = `
      <td class="col-pos">
        <span class="pos-badge ${posClass(p.position)}">${posDisplay}</span>
      </td>
      <td class="col-name">${p.name}</td>
      <td class="col-round ${scoreClass(p.roundScores[0])}">${fmt(p.roundScores[0])}</td>
      <td class="col-round ${scoreClass(p.roundScores[1])}">${fmt(p.roundScores[1])}</td>
      <td class="col-round ${scoreClass(p.roundScores[2])}">${fmt(p.roundScores[2])}</td>
      <td class="col-round ${scoreClass(p.roundScores[3])}">${fmt(p.roundScores[3])}</td>
      <td class="col-total ${scoreClass(p.total)}">${p.roundsWithData ? fmt(p.total) : '-'}</td>
      <td class="col-expand">${isExpanded ? '▲' : '▼'}</td>
    `;

    mainRow.addEventListener('click', () => toggleDetail(p.id));
    rows.push(mainRow);

    // Detail row
    const detailRow = document.createElement('tr');
    detailRow.className = `detail-row${isExpanded ? ' open' : ''}`;
    detailRow.dataset.detailFor = p.id;

    detailRow.innerHTML = `
      <td colspan="8">
        <div class="detail-inner">
          ${renderGolferCards(p)}
        </div>
      </td>
    `;

    rows.push(detailRow);
  });

  tbody.replaceChildren(...rows);
}

function renderGolferCards(participant) {
  const { golfers, droppedEach, penalties } = participant;

  return `
    <div class="golfer-grid">
      ${golfers.map((g, gi) => {
        const isDropped = droppedEach.some(d => d === g.name);
        const mc = g.missed_cut;

        const roundPills = g.rounds.map((score, ri) => {
          if (score === null) return '';
          const dropped = droppedEach[ri] === g.name;
          const isPenalty = mc && ri >= 2;
          let cls = 'round-pill';
          if (isPenalty) cls += ' penalty';
          else if (score < 0) cls += ' under';
          else if (score > 0) cls += ' over';
          else cls += ' even';
          if (dropped) cls += ' dropped-round';
          const label = isPenalty ? `CUT PEN: ${fmt(score)}` : `R${ri+1}: ${fmt(score)}`;
          return `<span class="${cls}" title="Round ${ri+1}${dropped ? ' (dropped)' : ''}${isPenalty ? ' — missed cut penalty' : ''}">${label}</span>`;
        }).join('');

        const statusTag = mc
          ? '<span class="mc-badge"> MISSED CUT</span>'
          : (g.thru && g.thru !== '-' && g.thru !== 'F'
              ? `<span style="font-size:0.72rem;color:#9a9a8e"> · Thru ${g.thru}</span>`
              : '');

        return `
          <div class="golfer-card ${mc ? 'missed-cut' : ''} ${isDropped ? 'dropped' : ''}">
            <div class="golfer-name">${g.name}${statusTag}</div>
            <div class="golfer-meta">
              <span>${g.live ? `Pos: ${g.position}` : 'No live data'}</span>
              <span>${g.live && g.total !== null ? `Total: ${fmt(g.total)}` : ''}</span>
            </div>
            <div class="golfer-rounds">${roundPills || '<span style="color:#9a9a8e;font-size:0.8rem">No scores yet</span>'}</div>
            ${isDropped ? '<div class="dropped-note">↑ Worst score dropped at least once</div>' : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function toggleDetail(id) {
  const mainRow = document.querySelector(`tr.main-row[data-id="${id}"]`);
  const detailRow = document.querySelector(`tr.detail-row[data-detail-for="${id}"]`);
  if (!mainRow || !detailRow) return;

  const isOpen = detailRow.classList.contains('open');

  if (isOpen) {
    expandedIds.delete(id);
    detailRow.classList.remove('open');
    mainRow.setAttribute('aria-expanded', 'false');
    mainRow.querySelector('.col-expand').textContent = '▼';
  } else {
    expandedIds.add(id);
    detailRow.classList.add('open');
    mainRow.setAttribute('aria-expanded', 'true');
    mainRow.querySelector('.col-expand').textContent = '▲';
  }
}

// ── Penalty info bar ─────────────────────────────────────────────────────────

function renderPenalties(data) {
  const el = document.getElementById('penaltyBar');
  if (!el) return;
  const p = data.penalties;
  if (!p || (p.round3 === null && p.round4 === null)) {
    el.style.display = 'none';
    return;
  }
  const r3 = p.round3 !== null ? `R3: ${fmt(p.round3)}` : 'R3: —';
  const r4 = p.round4 !== null ? `R4: ${fmt(p.round4)}` : 'R4: —';
  el.style.display = 'block';
  el.innerHTML = `✂ Missed cut penalty (avg of 10 worst active scores) &nbsp;·&nbsp; ${r3} &nbsp;·&nbsp; ${r4}`;
}

// ── Fetch & update ───────────────────────────────────────────────────────────

async function load() {
  try {
    const res = await fetch('/api/leaderboard');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    renderPrizes(data);
    renderLeaderboard(data);
    renderPenalties(data);

    const liveDot = document.getElementById('liveDot');
    const lastUpdated = document.getElementById('lastUpdated');

    if (data.lastUpdated) {
      const age = Math.floor((Date.now() - new Date(data.lastUpdated)) / 1000);
      liveDot.className = age > 180 ? 'live-dot stale' : 'live-dot';
      lastUpdated.textContent = `Updated ${timeSince(data.lastUpdated)}`;
    } else {
      liveDot.className = 'live-dot stale';
      lastUpdated.textContent = 'No live data';
    }
  } catch (e) {
    console.error('Load failed:', e);
    document.getElementById('lbBody').innerHTML =
      `<tr><td colspan="8" class="loading-cell">Failed to load scores. Retrying…</td></tr>`;
  }
}

function startCountdown() {
  clearInterval(timer);
  countdown = REFRESH_INTERVAL;

  timer = setInterval(() => {
    countdown--;
    const el = document.getElementById('countdown');
    if (el) el.textContent = `Auto-refresh in ${countdown}s`;

    if (countdown <= 0) {
      countdown = REFRESH_INTERVAL;
      load();
      if (activeTab === 'stats') loadStats();
    }
  }, 1000);
}

function refreshNow() {
  const btn = document.getElementById('refreshBtn');
  if (btn) btn.disabled = true;
  countdown = REFRESH_INTERVAL;
  const jobs = [load()];
  if (activeTab === 'stats') jobs.push(loadStats());
  Promise.allSettled(jobs).finally(() => {
    if (btn) btn.disabled = false;
  });
}

// ── Tabs ───────────────────────────────────────────────────────────────────────

let activeTab = 'leaderboard';
let statsData = null;

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => {
    const on = b.dataset.tab === tab;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  document.querySelectorAll('.tab-panel').forEach(p => {
    p.classList.toggle('active', p.id === `panel-${tab}`);
  });
  if (tab === 'stats' && !statsData) loadStats();
}

// ── Stats board ─────────────────────────────────────────────────────────────────

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    statsData = await res.json();
    renderStats(statsData);
  } catch (e) {
    console.error('Stats load failed:', e);
    const body = document.getElementById('statsBody');
    if (body) body.innerHTML = '<tr><td colspan="5" class="loading-cell">Failed to load stats. Retrying…</td></tr>';
  }
}

function renderStats(data) {
  const tbody = document.getElementById('statsBody');
  const golfers = data.golfers || [];
  if (!golfers.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">No field data yet.</td></tr>';
    return;
  }

  tbody.innerHTML = golfers.map((g, idx) => {
    const pos = g.missed_cut ? 'CUT' : (g.position && g.position !== '-' ? g.position : '–');
    const posCls = g.missed_cut ? 'pos-cut' : posClass(typeof g.position === 'string' && /^\d+$/.test(g.position) ? +g.position : 0);
    const chips = g.pickCount
      ? `<div class="picker-chips">${g.pickedBy.map(n => `<span class="picker-chip">${escapeHtml(n)}</span>`).join('')}</div>`
      : '';
    const scoreVal = g.total !== null && g.total !== undefined ? fmt(g.total) : '-';
    const thru = g.missed_cut ? '—' : (g.thru && g.thru !== '-' ? g.thru : (g.state === 'pre' ? 'Thu' : '-'));
    return `
      <tr class="stat-row${g.missed_cut ? ' is-cut' : ''}" onclick="openScorecard(${idx})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openScorecard(${idx})}" tabindex="0" role="button" aria-label="View ${escapeHtml(g.name)} scorecard">
        <td class="col-pos"><span class="pos-badge ${posCls}">${pos}</span></td>
        <td class="col-name"><span class="golfer-nm">${escapeHtml(g.name)}</span>${chips}</td>
        <td class="col-picks">${g.pickCount ? `<span class="pick-count">👥 ${g.pickCount}</span>` : '<span class="pick-zero">—</span>'}</td>
        <td class="col-total ${scoreClass(g.total)}">${scoreVal}</td>
        <td class="col-thru">${thru}</td>
      </tr>`;
  }).join('');
}

// ── Scorecard modal ──────────────────────────────────────────────────────────────

function openScorecard(idx) {
  const g = statsData && statsData.golfers && statsData.golfers[idx];
  if (!g) return;
  document.getElementById('modalContent').innerHTML = renderScorecard(g);
  const modal = document.getElementById('scorecardModal');
  modal.hidden = false;
  document.body.classList.add('modal-open');
  document.getElementById('modalClose').focus();
}

function closeScorecard() {
  document.getElementById('scorecardModal').hidden = true;
  document.body.classList.remove('modal-open');
}

function renderScorecard(g) {
  const cut = g.missed_cut;
  const totalTxt = (g.total !== null && g.total !== undefined) ? fmt(g.total) : 'E';
  const posTxt = cut ? 'Missed Cut' : (g.position && g.position !== '-' ? `Position ${g.position}` : 'Not started');

  // Round-by-round table with running cumulative to-par.
  let cum = 0;
  const roundRows = [0, 1, 2, 3].map(ri => {
    const s = g.rounds ? g.rounds[ri] : null;
    const played = s !== null && s !== undefined;
    if (played) cum += s;
    const isPenalty = cut && ri >= 2;
    return `
      <tr>
        <td class="sc-round">R${ri + 1}${isPenalty ? ' <span class="sc-pen">CUT PEN</span>' : ''}</td>
        <td class="sc-cell ${played ? scoreClass(s) : 'score-dash'}">${played ? fmt(s) : '–'}</td>
        <td class="sc-cell ${played ? scoreClass(cum) : 'score-dash'}">${played ? fmt(cum) : '–'}</td>
      </tr>`;
  }).join('');

  const thruLine = cut
    ? '<span class="sc-status cut">Missed the cut</span>'
    : (g.state === 'in'
        ? `<span class="sc-status live">● Live · Thru ${g.thru || '-'}</span>`
        : (g.state === 'post'
            ? '<span class="sc-status">Round complete</span>'
            : '<span class="sc-status">Tees off Thursday</span>'));

  const pickers = g.pickCount
    ? `<div class="sc-pickers">
         <div class="sc-pickers-label">Picked by ${g.pickCount} ${g.pickCount === 1 ? 'player' : 'players'}</div>
         <div class="picker-chips">${g.pickedBy.map(n => `<span class="picker-chip">${escapeHtml(n)}</span>`).join('')}</div>
       </div>`
    : '<div class="sc-pickers"><div class="sc-pickers-label">Not picked by anyone in the league</div></div>';

  return `
    <div class="sc-head">
      <div class="sc-name" id="modalGolferName">${escapeHtml(g.name)}</div>
      <div class="sc-meta">
        <span class="sc-pos">${posTxt}</span>
        <span class="sc-total ${scoreClass(g.total)}">${totalTxt}</span>
      </div>
      ${thruLine}
    </div>
    <table class="scorecard-table">
      <thead><tr><th>Round</th><th>To Par</th><th>Total</th></tr></thead>
      <tbody>${roundRows}</tbody>
    </table>
    ${pickers}
  `;
}

// Close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('scorecardModal');
    if (modal && !modal.hidden) closeScorecard();
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────

// Hide submit CTA after deadline
const SUBMISSION_DEADLINE = new Date('2026-07-16T05:35:00Z');
if (Date.now() >= SUBMISSION_DEADLINE) {
  const cta = document.getElementById('picksCta');
  if (cta) cta.style.display = 'none';
}

load();
startCountdown();
