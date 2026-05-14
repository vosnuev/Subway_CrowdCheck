// static/js/routes.js
// 나만의 루트 탭 (즐겨찾기 루트 CRUD)

function getFavs() {
  try { return JSON.parse(localStorage.getItem('favRoutes') || '[]'); }
  catch { return []; }
}
function saveFavs(arr) { localStorage.setItem('favRoutes', JSON.stringify(arr)); }

function renderFavList() {
  const favs = getFavs();
  const wrap = document.getElementById('fav-list');
  if (!favs.length) {
    wrap.innerHTML = `
      <div class="empty">
        <div class="empty-icon">⭐</div>
        <div>즐겨찾는 루트를 추가해 보세요</div>
      </div>`;
    return;
  }

  wrap.innerHTML = '';
  favs.forEach((fav, i) => {
    const h    = parseInt(fav.time.split(':')[0]);
    const pct  = getPct(fav.line, h);
    const lv   = congLevel(pct);
    const meta = LINE_META[fav.line];
    if (!meta) return; // 잘못된 데이터 방어

    const card = document.createElement('div');
    card.className = 'route-card';
    card.innerHTML = `
      <div class="route-ico" style="background:${meta.light}">🚇</div>
      <div class="route-info">
        <div class="route-name">${fav.name}</div>
        <div class="route-detail">
          <span class="badge"
            style="background:${meta.light};color:${meta.color};font-size:10px;padding:2px 7px;margin-right:5px">
            ${meta.name}
          </span>
          ${fav.from} → ${fav.to || '?'} · ${fav.time}
        </div>
      </div>
      <div class="route-right">
        <div class="badge" style="background:${lv.bg};color:${lv.tx};margin-bottom:4px">${lv.label}</div>
        <div style="font-size:15px;font-weight:900;font-family:'DM Mono',monospace;color:${lv.tx}">${pct}%</div>
      </div>
      <button class="del-btn" onclick="deleteFav(event,${i})">✕</button>`;

    // 루트 클릭 → 조회 탭으로 이동 후 자동 검색
    card.querySelector('.route-info').onclick = () => {
      document.getElementById('s-line').value = fav.line;
      onLineChange('s');
      setTimeout(() => {
        document.getElementById('s-station').value = fav.from;
        const [h2, m2] = fav.time.split(':').map(Number);
        document.getElementById('s-hour').value = h2;
        document.getElementById('s-min').value  = m2;
        showTab('search');
        setTimeout(doSearch, 80);
      }, 50);
    };

    wrap.appendChild(card);
  });
}

function deleteFav(e, i) {
  e.stopPropagation();
  const favs = getFavs();
  favs.splice(i, 1);
  saveFavs(favs);
  renderFavList();
}

function openAddForm() {
  document.getElementById('add-form').style.display = 'block';
  setTimeNow('f-hour', 'f-min');
}
function closeAddForm() { document.getElementById('add-form').style.display = 'none'; }

function saveFav() {
  const name = document.getElementById('f-name').value.trim();
  const line = document.getElementById('f-line').value;
  const from = document.getElementById('f-from').value;
  const to   = document.getElementById('f-to').value;
  const dir  = document.getElementById('f-dir').value;
  const h    = document.getElementById('f-hour').value;
  const m    = document.getElementById('f-min').value;

  if (!name || !line || !from) { alert('이름, 호선, 출발역을 입력해 주세요.'); return; }

  const time = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  const favs = getFavs();
  favs.push({ name, line, from, to, dir, time });
  saveFavs(favs);
  renderFavList();
  closeAddForm();
  document.getElementById('f-name').value = '';
}
