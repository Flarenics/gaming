let currentUserId = null;

// attach UI listeners once the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchBtn').addEventListener('click', lookupUser);
  document.getElementById('modeToggle').addEventListener('click', toggleMode);
  document.getElementById('rateEnable').addEventListener('change', toggleRate);
  document.getElementById('loadBtn').addEventListener('click', loadScores);
  document.getElementById('showMore').addEventListener('click', showNext);
});

  renderScores(true);
function renderScores(initial = false) {
  if (initial) {
    table.innerHTML = '';
    const header = `<tr><th>Map</th><th>Grade</th><th>Performance</th><th>Max Combo</th><th>Rate</th></tr>`;
    table.insertAdjacentHTML('beforeend', header);
  }

function toggleMode() {
  currentMode = currentMode === 2 ? 1 : 2;
  document.getElementById('modeToggle').innerText = `Mode: ${currentMode === 2 ? '7K' : '4K'}`;
  if (currentUserId) loadScores();
}

function toggleRate() {
  rateEnabled = document.getElementById('rateEnable').checked;
  document.getElementById('rateRange').disabled = !rateEnabled;
  if (currentUserId) loadScores();
}

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
  document.getElementById('filters').style.display = 'flex';
  document.getElementById('filters').style.display = 'block';
  loadScores();
}

async function loadScores() {
  if (!currentUserId) return;
  const grade = document.getElementById('grade').value;
  const sort = document.getElementById('sort').value;
  const params = new URLSearchParams({ sort, mode: currentMode });
  if (grade) params.append('grade', grade);
  if (rateEnabled) {
    const rate = document.getElementById('rateRange').value;
    params.append('rate', rate);
  }
  const res = await fetch(`/api/user/${currentUserId}/scores?${params.toString()}`);
  allScores = await res.json();
  displayIndex = 0;
  renderScores();
}

function renderScores() {
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
  for (const s of allScores.slice(displayIndex, displayIndex + PAGE_SIZE)) {
    const row = `<tr><td>${s.map.artist} - ${s.map.title} [${s.map.difficulty_name}]</td><td>${s.grade}</td><td>${s.performance_rating.toFixed(2)}</td><td>${s.max_combo}</td><td>${s.rate}</td></tr>`;
    table.insertAdjacentHTML('beforeend', row);
  }
  const showMore = document.getElementById('showMore');
  if (displayIndex + PAGE_SIZE < allScores.length) {
    showMore.style.display = 'block';
  } else {
    showMore.style.display = 'none';
  }
}

function showNext() {
  if (displayIndex + PAGE_SIZE < allScores.length) {
    displayIndex += PAGE_SIZE;
    renderScores();
  }
  for (const s of scores) {
    const row = `<tr><td>${s.map.artist} - ${s.map.title} [${s.map.difficulty_name}]</td><td>${s.grade}</td><td>${s.performance_rating.toFixed(2)}</td><td>${s.max_combo}</td><td>${s.rate}</td></tr>`;
    table.insertAdjacentHTML('beforeend', row);
  }
}
