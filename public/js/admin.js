/* ── Admin panel ─────────────────────────────────────────────────────────────── */

let adminPassword = '';
let tiers = null;
let participants = [];
let editingId = null;

// ── Auth ──────────────────────────────────────────────────────────────────────

function login() {
  const pw = document.getElementById('passwordInput').value.trim();
  if (!pw) return;
  adminPassword = pw;

  // Verify by attempting to load entries
  fetch('/api/entries')
    .then(r => r.json())
    .then(data => {
      // Simple check: if it's an array we got data (password is verified by admin routes)
      document.getElementById('authGate').style.display = 'none';
      document.getElementById('adminPanel').style.display = 'block';
      init();
    })
    .catch(() => {
      document.getElementById('authErr').textContent = 'Connection error. Please try again.';
    });
}

// ── Init ──────────────────────────────────────────────────────────────────────

async function init() {
  await Promise.all([loadTiers(), loadParticipants(), loadSettings(), loadArchives()]);
}

async function loadTiers() {
  const res = await fetch('/api/tiers');
  tiers = await res.json();
  populateTierSelects();
}

function populateTierSelects() {
  if (!tiers) return;

  for (let t = 1; t <= 4; t++) {
    const sel = document.getElementById(`fTier${t}`);
    if (!sel) continue;
    sel.innerHTML = '<option value="">Select golfer…</option>';
    (tiers[`tier${t}`] || []).forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.name;
      opt.textContent = g.odds != null ? `${g.name} (+${g.odds})` : g.name;
      sel.appendChild(opt);
    });
  }

  // Tier 5 select
  const sel5 = document.getElementById('fTier5Select');
  if (sel5) {
    sel5.innerHTML = '<option value="">Select or type below…</option>';
    (tiers.tier5 || []).forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.name;
      opt.textContent = g.odds != null ? `${g.name} (+${g.odds})` : g.name;
      sel5.appendChild(opt);
    });
  }
}

async function loadParticipants() {
  const res = await fetch('/api/entries');
  participants = await res.json();
  renderParticipants();
}

async function loadSettings() {
  const res = await fetch('/api/leaderboard');
  const data = await res.json();
  const s = data.settings || {};
  const p = data.penalties || {};

  const buyInEl = document.getElementById('sBuyIn');
  if (buyInEl) buyInEl.value = s.buyIn || 7;

  const buyInLabelEl = document.getElementById('buyInLabel');
  if (buyInLabelEl) buyInLabelEl.textContent = s.buyIn || 7;

  if (p.round3 !== null && p.round3 !== undefined) {
    const el = document.getElementById('sPenalty3');
    if (el) el.placeholder = `Auto: ${fmtNum(p.round3)}`;
  }
  if (p.round4 !== null && p.round4 !== undefined) {
    const el = document.getElementById('sPenalty4');
    if (el) el.placeholder = `Auto: ${fmtNum(p.round4)}`;
  }

  const lockStatusEl = document.getElementById('lockStatus');
  if (lockStatusEl) {
    lockStatusEl.textContent = s.locked
      ? 'Status: Submissions are LOCKED. New picks cannot be submitted.'
      : 'Status: Submissions are OPEN. Participants can submit picks at /picks.';
    lockStatusEl.style.color = s.locked ? 'var(--red)' : '#166534';
  }
}

function fmtNum(n) {
  if (n === null || n === undefined) return '-';
  return n > 0 ? `+${n}` : `${n}`;
}

// ── Render participants table ─────────────────────────────────────────────────

function renderParticipants() {
  const tbody = document.getElementById('participantBody');
  if (!participants.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="loading-cell">No participants yet.</td></tr>';
    return;
  }

  tbody.innerHTML = participants.map(p => `
    <tr>
      <td><strong>${p.name}</strong></td>
      <td>${p.picks[0] || '-'}</td>
      <td>${p.picks[1] || '-'}</td>
      <td>${p.picks[2] || '-'}</td>
      <td>${p.picks[3] || '-'}</td>
      <td>${p.picks[4] || '<em style="color:#9a9a8e">none</em>'}</td>
      <td>${p.paid
        ? '<span class="paid-badge">YES</span>'
        : '<span style="color:#9a9a8e;font-size:0.8rem">No</span>'}</td>
      <td style="white-space:nowrap;display:flex;gap:6px">
        <button class="btn-edit" onclick="startEdit('${p.id}')">Edit</button>
        <button class="btn-danger" onclick="deleteParticipant('${p.id}', '${p.name.replace(/'/g, "\\'")}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

// ── Add / Edit Form ───────────────────────────────────────────────────────────

function showAddForm() {
  editingId = null;
  document.getElementById('formTitle').textContent = 'Add Participant';
  document.getElementById('submitBtn').textContent = 'Add Participant';
  document.getElementById('editId').value = '';
  document.getElementById('entryForm').reset();
  document.getElementById('formErr').textContent = '';
  document.getElementById('entryFormSection').style.display = 'block';
  document.getElementById('entryFormSection').scrollIntoView({ behavior: 'smooth' });
}

function startEdit(id) {
  const p = participants.find(x => x.id === id);
  if (!p) return;

  editingId = id;
  document.getElementById('formTitle').textContent = `Edit — ${p.name}`;
  document.getElementById('submitBtn').textContent = 'Save Changes';
  document.getElementById('editId').value = id;
  document.getElementById('fName').value = p.name;
  document.getElementById('fPaid').checked = p.paid;
  document.getElementById('formErr').textContent = '';

  // Set tier picks
  for (let t = 1; t <= 4; t++) {
    const sel = document.getElementById(`fTier${t}`);
    if (sel) sel.value = p.picks[t - 1] || '';
  }

  // Tier 5
  const tier5Val = p.picks[4] || '';
  const sel5 = document.getElementById('fTier5Select');
  const custom5 = document.getElementById('fTier5Custom');
  const knownTier5 = (tiers?.tier5 || []).map(g => g.name);

  if (knownTier5.includes(tier5Val)) {
    sel5.value = tier5Val;
    custom5.value = '';
  } else {
    sel5.value = '';
    custom5.value = tier5Val;
  }

  document.getElementById('entryFormSection').style.display = 'block';
  document.getElementById('entryFormSection').scrollIntoView({ behavior: 'smooth' });
}

function hideForm() {
  editingId = null;
  document.getElementById('entryFormSection').style.display = 'none';
  document.getElementById('entryForm').reset();
  document.getElementById('formErr').textContent = '';
}

async function submitEntry(e) {
  e.preventDefault();

  const name = document.getElementById('fName').value.trim();
  const paid = document.getElementById('fPaid').checked;

  const picks = [];
  for (let t = 1; t <= 4; t++) {
    const val = document.getElementById(`fTier${t}`).value;
    if (!val) {
      document.getElementById('formErr').textContent = `Please select a Tier ${t} pick.`;
      return;
    }
    picks.push(val);
  }

  // Tier 5: prefer custom text if filled, otherwise use select
  const tier5Custom = document.getElementById('fTier5Custom').value.trim();
  const tier5Select = document.getElementById('fTier5Select').value;
  const tier5 = tier5Custom || tier5Select || '';
  if (tier5) picks.push(tier5);

  document.getElementById('formErr').textContent = '';
  document.getElementById('submitBtn').disabled = true;

  try {
    const isEdit = !!editingId;
    const url = isEdit ? `/api/entries/${editingId}` : '/api/entries';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: adminPassword, name, picks, paid })
    });

    const result = await res.json();

    if (!res.ok) {
      document.getElementById('formErr').textContent = result.error || 'Error saving participant.';
      return;
    }

    hideForm();
    await loadParticipants();
  } catch (err) {
    document.getElementById('formErr').textContent = 'Network error. Please try again.';
  } finally {
    document.getElementById('submitBtn').disabled = false;
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────

async function deleteParticipant(id, name) {
  if (!confirm(`Remove ${name} from the pool? This cannot be undone.`)) return;

  const res = await fetch(`/api/entries/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: adminPassword })
  });

  const result = await res.json();
  if (!res.ok) {
    alert(result.error || 'Error deleting participant.');
    return;
  }

  await loadParticipants();
}

// ── Settings ──────────────────────────────────────────────────────────────────

async function saveSettings(e) {
  e.preventDefault();

  const buyIn = parseFloat(document.getElementById('sBuyIn').value) || null;
  const p3Raw = document.getElementById('sPenalty3').value.trim();
  const p4Raw = document.getElementById('sPenalty4').value.trim();

  const penaltyScores = {
    round3: p3Raw !== '' ? parseFloat(p3Raw) : null,
    round4: p4Raw !== '' ? parseFloat(p4Raw) : null
  };

  document.getElementById('settingsErr').textContent = '';
  document.getElementById('settingsOk').textContent = '';

  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: adminPassword, buyIn, penaltyScores })
    });

    const result = await res.json();
    if (!res.ok) {
      document.getElementById('settingsErr').textContent = result.error || 'Error saving settings.';
      return;
    }

    document.getElementById('settingsOk').textContent = 'Settings saved!';
    setTimeout(() => {
      document.getElementById('settingsOk').textContent = '';
    }, 3000);
  } catch (err) {
    document.getElementById('settingsErr').textContent = 'Network error.';
  }
}

// ── Submission lock ───────────────────────────────────────────────────────────

async function setLock(locked) {
  const msg = document.getElementById('lockMsg');
  msg.textContent = '';

  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: adminPassword, locked })
    });

    const result = await res.json();
    if (!res.ok) {
      msg.textContent = result.error || 'Error updating lock.';
      msg.style.color = 'var(--red)';
      return;
    }

    msg.style.color = '#166534';
    msg.textContent = locked ? 'Submissions locked.' : 'Submissions unlocked.';
    await loadSettings();
    setTimeout(() => { msg.textContent = ''; }, 3000);
  } catch (err) {
    msg.textContent = 'Network error.';
    msg.style.color = 'var(--red)';
  }
}

// ── Tournament history ────────────────────────────────────────────────────────

function scoreCls(score) {
  if (score === null || score === undefined) return 'score-dash';
  if (score < 0) return 'score-under';
  if (score === 0) return 'score-even';
  return 'score-over';
}

async function loadArchives() {
  try {
    const res = await fetch('/api/archives');
    const archives = await res.json();
    renderArchives(archives);
  } catch (e) {
    const body = document.getElementById('archiveBody');
    if (body) body.innerHTML = '<tr><td colspan="7" class="loading-cell">Failed to load history.</td></tr>';
  }
}

function renderArchives(archives) {
  const body = document.getElementById('archiveBody');
  if (!body) return;
  if (!archives.length) {
    body.innerHTML = '<tr><td colspan="7" class="loading-cell">No archived tournaments yet.</td></tr>';
    return;
  }
  body.innerHTML = archives.map(a => `
    <tr>
      <td><strong>${a.tournamentName}</strong>${a.course ? `<br><span style="color:#9a9a8e;font-size:0.78rem">${a.course}</span>` : ''}</td>
      <td>${a.year ?? '-'}</td>
      <td>${a.winner || '-'}</td>
      <td>${a.entrants}</td>
      <td>$${a.totalPool}</td>
      <td style="font-size:0.8rem;color:#6b6b5e">${a.archivedAt ? new Date(a.archivedAt).toLocaleDateString() : '-'}</td>
      <td><button class="btn-edit" onclick="viewArchive('${a.id}')">View</button></td>
    </tr>
  `).join('');
}

async function viewArchive(id) {
  try {
    const res = await fetch(`/api/archives/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('not found');
    const a = await res.json();
    renderArchiveDetail(a);
  } catch (e) {
    alert('Could not load that archive.');
  }
}

function renderArchiveDetail(a) {
  document.getElementById('archiveDetailTitle').textContent =
    `${a.tournamentName}${a.year ? ' ' + a.year : ''} — Final Standings`;

  const lb = a.leaderboard || [];
  document.getElementById('archiveLbBody').innerHTML = lb.map((p, idx) => {
    const tied = idx > 0 && lb[idx - 1].position === p.position && p.position !== '-';
    const posDisplay = p.position === '-' ? '-' : (tied ? `T${p.position}` : p.position);
    return `
      <tr>
        <td class="col-pos"><span class="pos-badge ${posClass(p.position)}">${posDisplay}</span></td>
        <td class="col-name">${p.name}</td>
        <td class="col-round ${scoreCls(p.roundScores[0])}">${fmtNum(p.roundScores[0])}</td>
        <td class="col-round ${scoreCls(p.roundScores[1])}">${fmtNum(p.roundScores[1])}</td>
        <td class="col-round ${scoreCls(p.roundScores[2])}">${fmtNum(p.roundScores[2])}</td>
        <td class="col-round ${scoreCls(p.roundScores[3])}">${fmtNum(p.roundScores[3])}</td>
        <td class="col-total ${scoreCls(p.total)}">${p.roundsWithData ? fmtNum(p.total) : '-'}</td>
      </tr>`;
  }).join('');

  const detail = document.getElementById('archiveDetail');
  detail.style.display = 'block';
  detail.scrollIntoView({ behavior: 'smooth' });
}

function posClass(pos) {
  if (pos === 1) return 'pos-1';
  if (pos === 2) return 'pos-2';
  if (pos === 3) return 'pos-3';
  return 'pos-other';
}

function closeArchive() {
  document.getElementById('archiveDetail').style.display = 'none';
}

async function snapshotNow() {
  const msg = document.getElementById('snapshotMsg');
  msg.style.color = '#166534';
  msg.textContent = 'Archiving current standings…';
  try {
    const res = await fetch('/api/admin/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: adminPassword })
    });
    const result = await res.json();
    if (!res.ok) {
      msg.style.color = 'var(--red)';
      msg.textContent = result.error || 'Snapshot failed.';
      return;
    }
    msg.textContent = `Snapshot saved (${result.archive.entrants} entrants${result.archive.winner ? `, leader: ${result.archive.winner}` : ''}).`;
    await loadArchives();
    setTimeout(() => { msg.textContent = ''; }, 4000);
  } catch (e) {
    msg.style.color = 'var(--red)';
    msg.textContent = 'Network error.';
  }
}

// ── Force refresh ─────────────────────────────────────────────────────────────

async function forceRefresh() {
  const msg = document.getElementById('refreshMsg');
  msg.textContent = 'Refreshing…';

  try {
    const res = await fetch('/api/refresh', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      msg.textContent = `Refreshed! Last updated: ${new Date(data.lastUpdated).toLocaleTimeString()}`;
    } else {
      msg.textContent = 'Refresh failed.';
    }
  } catch (e) {
    msg.textContent = 'Network error.';
  }
}
