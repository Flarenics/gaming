let currentUserId = null;

async function lookupUser() {
  const name = document.getElementById('username').value.trim();
  if (!name) return;
  const res = await fetch(`/api/user/${encodeURIComponent(name)}`);
  if (!res.ok) {
    alert('User not found');
    return;
  }
  const user = await res.json();
  currentUserId = user.id;
  document.getElementById('user-info').innerText = `User: ${user.username} (ID: ${user.id})`;
  document.getElementById('filters').style.display = 'block';
  loadScores();
}

async function loadScores() {
  if (!currentUserId) return;
  const grade = document.getElementById('grade').value;
  const sort = document.getElementById('sort').value;
  const rate = document.getElementById('rateRange').value;
  const params = new URLSearchParams({ sort });
  if (grade) params.append('grade', grade);
  if (rate) params.append('rate', rate);
  const res = await fetch(`/api/user/${currentUserId}/scores?${params.toString()}`);
  const scores = await res.json();
  renderScores(scores);
}

function renderScores(scores) {
  const table = document.getElementById('scores-table');
  table.innerHTML = '';
  const header = `<tr><th>Map</th><th>Grade</th><th>Performance</th><th>Max Combo</th><th>Rate</th></tr>`;
  table.insertAdjacentHTML('beforeend', header);
  for (const s of scores) {
    const row = `<tr><td>${s.map.artist} - ${s.map.title} [${s.map.difficulty_name}]</td><td>${s.grade}</td><td>${s.performance_rating.toFixed(2)}</td><td>${s.max_combo}</td><td>${s.rate}</td></tr>`;
    table.insertAdjacentHTML('beforeend', row);
  }
}
