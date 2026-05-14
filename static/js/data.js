// static/js/data.js
// Python → Flask → Jinja2로 주입된 데이터를 JS 전역 변수로 노출
// base.html 의 <script> 블록에서 window.__APP_DATA__ 를 세팅한 뒤 이 파일이 읽어옴

const LINE_META    = window.__APP_DATA__.LINE_META;
const STATIONS     = window.__APP_DATA__.STATIONS;
const PATTERNS     = window.__APP_DATA__.PATTERNS;
const LINE_PATTERN = window.__APP_DATA__.LINE_PATTERN;

/** 특정 호선·시간의 혼잡도(%) 반환 */
function getPct(line, hour) {
  const patternKey = LINE_PATTERN[line] || 'balanced';
  const pattern    = PATTERNS[patternKey];
  const idx = Math.max(0, Math.min(18, hour - 5));
  return pattern[idx];
}

/** 혼잡도 % → 레벨 객체 { label, bg, tx } */
function congLevel(pct) {
  if (pct < 20) return { label: '여유',     bg: '#e6f7ee', tx: '#166534' };
  if (pct < 40) return { label: '보통',     bg: '#dcfce7', tx: '#15803d' };
  if (pct < 60) return { label: '혼잡',     bg: '#fef9c3', tx: '#854d0e' };
  if (pct < 75) return { label: '매우혼잡', bg: '#ffedd5', tx: '#9a3412' };
  if (pct < 88) return { label: '붐빔',     bg: '#fee2e2', tx: '#991b1b' };
  return               { label: '헬게이트', bg: '#fecaca', tx: '#7f1d1d' };
}

/** 해당 노선에서 가장 쾌적한 시간대 반환 */
function findBestHour(line, currentHour) {
  let bestH = currentHour, bestPct = 999;
  for (let h = 5; h <= 23; h++) {
    const p = getPct(line, h);
    if (p < bestPct) { bestPct = p; bestH = h; }
  }
  return bestH;
}
