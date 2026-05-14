# Subway_CrowdCheck_app — Cowork 프로젝트 프롬프트

## 프로젝트 개요

서울 지하철 시간대별 혼잡도를 조회·비교하는 **Flask 기반 웹 앱**입니다.  
사용자가 호선과 역을 선택하면 해당 시간대의 혼잡도를 시각적으로 보여주고,  
지금 출발 vs 1시간 후 출발 비교, 즐겨찾기 루트 저장 기능을 제공합니다.

---

## 기술 스택

- **Backend**: Python 3.11+, Flask 3.x
- **Frontend**: Vanilla JS, Jinja2 템플릿, CSS 변수
- **환경관리**: uv (pyproject.toml), python-dotenv
- **데이터**: 서울교통공사 30분 단위 혼잡도 통계 기반 패턴 (추후 실시간 API 연동 예정)
- **저장소**: https://github.com/vosnuev/Subway_CrowdCheck.git

---

## 프로젝트 구조

```
Subway_CrowdCheck_app/
├── app.py                  # Flask 메인 (라우팅 + REST API)
├── pyproject.toml          # uv 환경 설정
├── requirements.txt
├── .env                    # 🔑 환경변수 (gitignore — 로컬에만 존재)
├── .env.example            # 환경변수 예시 (공개)
├── .gitignore
│
├── data/
│   ├── line_meta.py        # 호선 이름·색상 (1~9호선 + 광역·경전철 22개)
│   ├── stations.py         # 호선별 역 목록 전체
│   └── congestion.py       # 혼잡도 패턴 데이터 + get_congestion_pct(), cong_level()
│
├── templates/
│   ├── base.html           # 공통 레이아웃 (헤더, 탭, 모달, Python→JS 데이터 주입)
│   ├── tab_search.html     # 노선 조회 탭 HTML
│   ├── tab_compare.html    # 시간 비교 탭 HTML
│   └── tab_routes.html     # 나만의 루트 탭 HTML
│
└── static/
    ├── css/style.css       # 전체 스타일 (라이트 테마)
    └── js/
        ├── data.js         # Python→JS 데이터 전달, getPct(), congLevel()
        ├── ui.js           # 탭전환, 시계, 드롭다운, 즐겨찾기 시간 모달
        ├── search.js       # 노선 조회 로직 및 결과 렌더링
        ├── compare.js      # 시간 비교 로직 및 히트맵 렌더링
        └── routes.js       # 나만의 루트 CRUD (localStorage)
```

---

## 주요 기능

### 1. 노선 조회 탭
- 22개 호선 선택 (1~9호선, 수인분당선, 경의중앙선, 공항철도 등)
- 역 선택 시 방향 드롭다운이 자동 변경 (`판교 방면 (다음: 이매)` 형식)
- 2호선은 내선순환/외선순환 자동 처리
- 즐겨찾기 시간 6개 (3×2 그리드, 더블클릭 수정), 현재 시간 기본값
- 시간은 10분 단위 드롭다운
- 결과: 4:6 레이아웃 (좌=입력, 우=결과)
  - 호선+역명+방향+기준시간 한 줄 요약
  - 혼잡도 % + 레벨 뱃지 (여유/보통/혼잡/매우혼잡/붐빔/헬게이트)
  - 오늘 5~23시 전체 막대 그래프
  - 혼잡 시 추천 시간대 안내

### 2. 시간 비교 탭
- 지금 출발 vs 1시간 후 혼잡도 카드 비교
- 추천 메시지 (어떤 시간이 더 쾌적한지)
- 전체 시간대 히트맵 (클릭 없이 시각 표시만)

### 3. 나만의 루트 탭
- 출발역·도착역·호선·방향·시간 저장 (localStorage)
- 저장된 루트 클릭 시 조회 탭에서 자동 검색
- 루트 삭제 기능

---

## REST API

| 경로 | 설명 |
|------|------|
| `GET /` | 메인 페이지 |
| `GET /api/lines` | 전체 호선 메타 정보 |
| `GET /api/stations/{line}` | 호선별 역 목록 |
| `GET /api/congestion/{line}/{hour}` | 특정 시간 혼잡도 |
| `GET /api/congestion/{line}/all` | 5~23시 전체 혼잡도 배열 |

---

## 환경변수 (.env)

```
FLASK_SECRET_KEY=    # Flask 세션 키
FLASK_DEBUG=1
HOST=127.0.0.1
PORT=5000
SEOUL_API_KEY=       # 서울 열린데이터광장 (추후 실시간 연동)
STC_API_KEY=         # 서울교통공사 혼잡도 API
GEOVISION_API_KEY=   # 지오비전 실시간 혼잡도 (선택)
```

---

## 앞으로 할 작업 (TODO)

- [ ] 서울 열린데이터광장 API 키 발급 및 실시간 혼잡도 연동
      → `data/congestion.py`의 `get_congestion_pct()` 함수만 교체하면 됨
- [ ] 서버 배포 (Render / Railway 등)
- [ ] 모바일 UI 최적화

---

## 로컬 실행

```bash
# uv 사용
uv venv && uv sync
.venv\Scripts\activate   # Windows
python app.py

# pip 사용
pip install -r requirements.txt
python app.py
# → http://localhost:5000
```

---

## Git 푸시 (처음 한 번)

```bash
# GitHub Personal Access Token 필요 (repo 권한)
git remote set-url origin https://<YOUR_TOKEN>@github.com/vosnuev/Subway_CrowdCheck.git
git push -u origin main
```

---

## 개발 컨텍스트

- 한국어 UI, Noto Sans KR + DM Mono 폰트
- 라이트 테마 (CSS 변수 기반, 다크 테마 전환 가능 구조)
- Python 데이터(LINE_META, STATIONS, PATTERNS)를 Flask가 JSON으로 직렬화 →
  `base.html`의 `window.__APP_DATA__`로 주입 → `static/js/data.js`에서 JS 전역변수로 사용
- localStorage 사용: 즐겨찾기 루트(`favRoutes`), 즐겨찾기 시간(`favTimes`)
- 실시간 API 없이도 서울교통공사 통계 기반 패턴으로 완전히 동작
