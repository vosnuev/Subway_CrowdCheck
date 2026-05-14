// static/js/compare.js
// 시간 비교 탭 로직

function doCompare() {
  const line = document.getElementById('c-line').value;
  const sta  = document.getElementById('c-station').value;
  const h    = parseInt(document.getElementById('c-hour').value);
  const m    = parseInt(document.getElementById('c-min').value);

  if (!line || !sta) { alert('호선과 역을 선택해 주세요.'); return; }

  const h2   = Math.min(23, h + 1);
  const p1   = getPct(line, h),  p2  = getPct(line, h2);
  const l1   = congLevel(p1),    l2  = congLevel(p2);
  const meta = LINE_META[line];

  const winner = p1 <= p2 ? 1 : 2;
  const diff   = Math.abs(p1 - p2);

  const heatHTML = _buildHeatmap(line, sta, h, h2);

  const recoText = winner === 1
    ? `지금(${String(h).padStart(2,'0')}:00) 출발이 더 쾌적해요! ${diff}%p 덜 혼잡합니다.`
    : `1시간 후(${String(h2).padStart(2,'0')}:00) 출발이 더 쾌적해요! ${diff}%p 덜 혼잡합니다.`;

  document.getElementById('compare-result').innerHTML = `
    <div class="cmp-grid">
      <div class="cmp-card ${winner === 1 ? 'winner' : ''}">
        <div class="cmp-time">지금 출발 · ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}</div>
        <div class="cmp-pct" style="color:${l1.tx}">${p1}%</div>
        <div class="cmp-lbl">
          <span class="badge" style="background:${l1.bg};color:${l1.tx}">${l1.label}</span>
        </div>
        <div class="meter-track" style="margin-top:10px">
          <div class="meter-bar" style="width:${p1}%;background:${l1.tx}"></div>
        </div>
        ${winner === 1 ? '<div style="margin-top:8px;font-size:11px;color:#3b5bdb;font-weight:700">✓ 추천</div>' : ''}
      </div>

      <div class="cmp-card ${winner === 2 ? 'winner' : ''}">
        <div class="cmp-time">1시간 후 · ${String(h2).padStart(2,'0')}:00</div>
        <div class="cmp-pct" style="color:${l2.tx}">${p2}%</div>
        <div class="cmp-lbl">
          <span class="badge" style="background:${l2.bg};color:${l2.tx}">${l2.label}</span>
        </div>
        <div class="meter-track" style="margin-top:10px">
          <div class="meter-bar" style="width:${p2}%;background:${l2.tx}"></div>
        </div>
        ${winner === 2 ? '<div style="margin-top:8px;font-size:11px;color:#3b5bdb;font-weight:700">✓ 추천</div>' : ''}
      </div>
    </div>

    <div class="reco" style="margin-top:12px">
      <div class="reco-icon">${winner === 1 ? '🏃' : '⏳'}</div>
      <div>
        <div class="reco-title">${winner === 1 ? '지금 바로 출발하세요!' : '조금 기다리는 게 좋아요'}</div>
        <div class="reco-desc">${recoText}</div>
      </div>
    </div>

    <div class="card" style="margin-top:12px">
      <div class="card-title">전체 시간대 혼잡도</div>
      <div class="heatmap-wrap">${heatHTML}</div>
    </div>
  `;
}

function _buildHeatmap(line, sta, h1, h2) {
  const hours = Array.from({ length: 19 }, (_, i) => i + 5); // 5~23

  const headerCells = hours.map(hr => `<div class="hm-hour">${hr}</div>`).join('');
  const dataCells   = hours.map(hr => {
    const p  = getPct(line, hr);
    const lv = congLevel(p);
    const sel = hr === h1 || hr === h2;
    return `<div class="hm-cell"
      style="background:${lv.bg};color:${lv.tx};${sel ? 'outline:2px solid #3b5bdb;' : ''}cursor:default">
      ${p}
    </div>`;
  }).join('');

  return `
    <div class="heatmap">
      <div class="hm-label"></div>${headerCells}
      <div class="hm-label">${sta.slice(0, 4)}</div>${dataCells}
    </div>`;
}
