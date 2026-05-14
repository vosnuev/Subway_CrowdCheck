// static/js/ui.js
// 탭 전환 / 시계 / 드롭다운 초기화 / 즐겨찾기 시간 모달

// ── 시계 ────────────────────────────────────────────────
function tick() {
  const d = new Date();
  document.getElementById('clock').textContent =
    String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
tick();
setInterval(tick, 15000);

// ── 탭 전환 ─────────────────────────────────────────────
function showTab(id) {
  const names = ['search', 'compare', 'routes'];
  document.querySelectorAll('.tab').forEach((t, i) =>
    t.classList.toggle('active', names[i] === id)
  );
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  if (id === 'routes') renderFavList();
}

// ── 현재 시간 → 10분 단위 반내림 ───────────────────────
function nowHM() {
  const d = new Date();
  return { h: d.getHours(), m: Math.floor(d.getMinutes() / 10) * 10 };
}

// ── 시·분 select 빌드 ─────────────────────────────────
function buildHourSelect(el) {
  el.innerHTML = '';
  for (let h = 5; h <= 23; h++) {
    const o = document.createElement('option');
    o.value = h;
    o.textContent = String(h).padStart(2, '0') + '시';
    el.appendChild(o);
  }
}

function buildMinSelect(el) {
  el.innerHTML = '';
  for (let m = 0; m < 60; m += 10) {
    const o = document.createElement('option');
    o.value = m;
    o.textContent = String(m).padStart(2, '0') + '분';
    el.appendChild(o);
  }
}

function setTimeNow(hourId, minId) {
  const { h, m } = nowHM();
  const hEl = document.getElementById(hourId);
  const mEl = document.getElementById(minId);
  if (hEl) hEl.value = Math.max(5, Math.min(23, h));
  if (mEl) mEl.value = m;
}

// ── 호선 select 초기화 ───────────────────────────────────
function buildLineSelects() {
  ['s-line', 'c-line', 'f-line'].forEach(id => {
    const sel = document.getElementById(id);
    Object.entries(LINE_META).forEach(([k, v]) => {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = v.name;
      o.style.color = v.color;
      o.style.fontWeight = '700';
      sel.appendChild(o);
    });
  });
}

// ── 호선 선택 변경 ───────────────────────────────────────
function onLineChange(prefix) {
  const lineVal = document.getElementById(prefix + '-line').value;

  // 선택된 호선 색상 적용
  const lineEl = document.getElementById(prefix + '-line');
  lineEl.style.color = lineVal && LINE_META[lineVal] ? LINE_META[lineVal].color : '';

  // 역 목록 채우기
  if (prefix === 's') {
    fillStations(lineVal, 's-station');
    updateDirOptions('s', lineVal, '');
  }
  if (prefix === 'c') fillStations(lineVal, 'c-station');
  if (prefix === 'f') {
    fillStations(lineVal, 'f-from');
    fillStations(lineVal, 'f-to');
  }
}

function fillStations(lineVal, selId) {
  const sel = document.getElementById(selId);
  if (!sel) return;
  sel.innerHTML = '<option value="">역 선택</option>';
  if (!lineVal || !STATIONS[lineVal]) return;
  STATIONS[lineVal].forEach(s => {
    const o = document.createElement('option');
    o.value = s;
    o.textContent = s;
    sel.appendChild(o);
  });
}

// ── 방향 옵션 (전역·후역 기준) ───────────────────────────
function getTermini(line) {
  const arr = STATIONS[line] || [];
  return { first: arr[0] || '기점', last: arr[arr.length - 1] || '종점' };
}

function updateDirOptions(prefix, line, station) {
  const dirSel = document.getElementById(prefix + '-dir');
  if (!dirSel) return;

  // 2호선 순환선
  if (line === '2') {
    const arr = STATIONS['2'] || [];
    const idx = arr.indexOf(station);
    const safeIdx = idx >= 0 ? idx : 0;
    const nextDown = arr[(safeIdx + 1) % arr.length] || '';
    const nextUp   = arr[(safeIdx - 1 + arr.length) % arr.length] || '';
    dirSel.innerHTML = `
      <option value="down">내선순환 (다음: ${nextDown})</option>
      <option value="up">외선순환 (다음: ${nextUp})</option>
    `;
    return;
  }

  const { first, last } = getTermini(line);
  const arr = STATIONS[line] || [];
  const idx = arr.indexOf(station);
  const prevSta = idx > 0 ? arr[idx - 1] : null;
  const nextSta = (idx >= 0 && idx < arr.length - 1) ? arr[idx + 1] : null;

  const downLabel = nextSta ? `${last} 방면 (다음: ${nextSta})` : `${last} 방면`;
  const upLabel   = prevSta ? `${first} 방면 (다음: ${prevSta})` : `${first} 방면`;

  const curVal = dirSel.value;
  dirSel.innerHTML = `
    <option value="down">${downLabel}</option>
    <option value="up">${upLabel}</option>
  `;
  dirSel.value = curVal || 'down';
}

// ── 즐겨찾기 시간 (localStorage) ────────────────────────
const DEFAULT_FAV_TIMES = ['07:00', '08:00', '09:00', '17:30', '18:00', '19:00'];

function getFavTimes() {
  try { return JSON.parse(localStorage.getItem('favTimes') || 'null') || DEFAULT_FAV_TIMES.slice(); }
  catch { return DEFAULT_FAV_TIMES.slice(); }
}
function setFavTimes(arr) { localStorage.setItem('favTimes', JSON.stringify(arr)); }

let _editingSlot = -1;

function renderFavChips() {
  const times = getFavTimes();
  const wrap  = document.getElementById('fav-chips');
  wrap.innerHTML = '';
  times.forEach((t, i) => {
    const chip = document.createElement('div');
    chip.className = 'time-chip';
    chip.innerHTML = `<span>${t}</span><span style="font-size:10px;opacity:.6">✏️</span>`;
    chip.title = '클릭: 선택 / 더블클릭: 수정';

    chip.onclick = () => {
      const [h, m] = t.split(':').map(Number);
      document.getElementById('s-hour').value = h;
      document.getElementById('s-min').value  = m;
      document.querySelectorAll('#fav-chips .time-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    };
    chip.ondblclick = e => { e.stopPropagation(); openTimeModal(i, t); };
    wrap.appendChild(chip);
  });
}

function openTimeModal(slot, curTime) {
  _editingSlot = slot;
  const [h, m] = curTime.split(':').map(Number);
  buildHourSelect(document.getElementById('modal-hour'));
  buildMinSelect(document.getElementById('modal-min'));
  document.getElementById('modal-hour').value = h;
  document.getElementById('modal-min').value  = m;
  document.getElementById('modal-title').textContent = `즐겨찾기 시간 ${slot + 1} 수정`;
  document.getElementById('time-modal').classList.add('open');
}
function closeTimeModal() { document.getElementById('time-modal').classList.remove('open'); }
function saveTimeModal() {
  const h = document.getElementById('modal-hour').value;
  const m = document.getElementById('modal-min').value;
  const t = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  const arr = getFavTimes();
  arr[_editingSlot] = t;
  setFavTimes(arr);
  renderFavChips();
  closeTimeModal();
}

// ── 툴팁 ────────────────────────────────────────────────
function showTT(e, txt) {
  const tt = document.getElementById('tt');
  tt.textContent = txt;
  tt.style.left    = (e.clientX + 14) + 'px';
  tt.style.top     = (e.clientY - 34) + 'px';
  tt.style.opacity = '1';
}
function hideTT() { document.getElementById('tt').style.opacity = '0'; }

// ── 초기화 ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // 시·분 셀렉트 빌드
  ['s-hour', 'c-hour', 'f-hour'].forEach(id => {
    const el = document.getElementById(id);
    if (el) buildHourSelect(el);
  });
  ['s-min', 'c-min', 'f-min'].forEach(id => {
    const el = document.getElementById(id);
    if (el) buildMinSelect(el);
  });

  // 현재 시간 기본값
  setTimeNow('s-hour', 's-min');
  setTimeNow('c-hour', 'c-min');
  setTimeNow('f-hour', 'f-min');

  // 호선 드롭다운
  buildLineSelects();

  // 즐겨찾기 시간 칩
  renderFavChips();

  // 역 선택 시 방향 업데이트
  document.getElementById('s-station').addEventListener('change', function () {
    updateDirOptions('s', document.getElementById('s-line').value, this.value);
  });

  // 모달 바깥 클릭 닫기
  document.getElementById('time-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('time-modal')) closeTimeModal();
  });
});
