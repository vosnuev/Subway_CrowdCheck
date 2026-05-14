// static/js/search.js
// 노선 조회 탭 로직

function doSearch() {
  const line    = document.getElementById('s-line').value;
  const station = document.getElementById('s-station').value;
  const dirSel  = document.getElementById('s-dir');
  const dirText = dirSel.options[dirSel.selectedIndex]?.text || '';
  const h       = parseInt(document.getElementById('s-hour').value);
  const m       = parseInt(document.getElementById('s-min').value);

  if (!line)    { alert('호선을 선택해 주세요.'); return; }
  if (!station) { alert('역을 선택해 주세요.'); return; }

  const pct     = getPct(line, h);
  const lv      = congLevel(pct);
  const meta    = LINE_META[line];
  const timeStr = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');

  const bestH   = findBestHour(line, h);
  const bPct    = getPct(line, bestH);
  const bLv     = congLevel(bPct);

  // 시간대별 막대
  const hoursHTML = _buildHourlyBars(line, h);

  // 추천 띠
  const recoHTML = pct >= 60 ? `
    <div class="reco">
      <div class="reco-icon">💡</div>
      <div>
        <div class="reco-title">${bestH}시에 출발하면 훨씬 쾌적해요</div>
        <div class="reco-desc">
          지금보다 ${pct - bPct}%p 덜 혼잡 ·
          <span style="font-weight:700">${bLv.label}</span> (${bPct}%)
        </div>
      </div>
    </div>` : '';

  document.getElementById('search-result').innerHTML = `
    <div class="card" style="padding:14px 18px">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px">
        <span class="badge" style="
          background:${meta.light};color:${meta.color};
          border:1px solid ${meta.color}44;font-size:11px;padding:3px 9px;
          display:inline-flex;align-items:center;gap:5px">
          <span style="width:7px;height:7px;border-radius:50%;background:${meta.color};display:inline-block"></span>
          ${meta.name}
        </span>
        <span style="font-size:15px;font-weight:800">${station}역</span>
        <span style="font-size:11px;color:var(--text-dim)">${dirText}</span>
        <span style="margin-left:auto;font-size:11px;color:var(--text-muted);font-family:'DM Mono',monospace">
          ${timeStr} 기준
        </span>
      </div>

      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span class="badge" style="background:${lv.bg};color:${lv.tx};font-size:12px;padding:4px 12px">
          ${lv.label}
        </span>
        <span style="font-size:22px;font-weight:900;font-family:'DM Mono',monospace;color:${lv.tx}">
          ${pct}%
        </span>
      </div>
      <div class="meter-track">
        <div class="meter-bar" style="width:${pct}%;background:${lv.tx}"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);margin-top:3px">
        <span>여유</span><span>보통</span><span>혼잡</span><span>매우혼잡</span><span>붐빔</span>
      </div>
    </div>

    ${recoHTML}

    <div class="card" style="margin-top:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div class="card-title" style="margin-bottom:0">오늘 시간대별 혼잡도</div>
        <span style="font-size:10px;color:var(--text-muted);background:var(--surface2);
          border:1px solid var(--border);border-radius:20px;padding:2px 8px">
          📊 서울교통공사 통계 기반
        </span>
      </div>
      ${hoursHTML}
    </div>
  `;
}

function _buildHourlyBars(line, selectedH) {
  let html = '';
  for (let hr = 5; hr <= 23; hr++) {
    const p   = getPct(line, hr);
    const lv  = congLevel(p);
    const sel = hr === selectedH;
    html += `
      <div class="hbar-row${sel ? ' selected' : ''}">
        <span class="hbar-hour">${String(hr).padStart(2, '0')}시</span>
        <div class="hbar-wrap">
          <div class="hbar-fill" style="width:${p}%;background:${lv.tx};opacity:${sel ? 1 : 0.55}"></div>
        </div>
        <span class="hbar-pct" style="color:${sel ? lv.tx : 'var(--text-muted)'}">
          ${p}%
        </span>
      </div>`;
  }
  return html;
}
