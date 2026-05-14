# 🚇 Subway_CrowdCheck_app

서울 지하철 시간대별 혼잡도를 조회하는 Flask 웹 앱입니다.  
서울교통공사 통계 기반 패턴 데이터를 사용하며, 추후 실시간 공공 API 연동 구조로 설계되었습니다.

---

## 📁 프로젝트 구조

```
Subway_CrowdCheck_app/
├── app.py                  # Flask 메인 (라우팅 + REST API)
├── pyproject.toml          # uv 프로젝트 설정
├── requirements.txt        # pip 호환 의존성
├── .env                    # 🔑 환경변수 (gitignore됨 — 직접 생성)
├── .env.example            # 환경변수 예시 (키값 없이 공개)
├── .gitignore
├── README.md
│
├── data/                   # Python 데이터 계층
│   ├── __init__.py
│   ├── line_meta.py        # 호선별 이름·색상
│   ├── stations.py         # 호선별 역 목록 (1~9호선 + 광역·경전철)
│   └── congestion.py       # 혼잡도 패턴 + 계산 함수
│
├── templates/              # Jinja2 HTML 템플릿
│   ├── base.html           # 공통 레이아웃 (헤더·탭·모달·JS 데이터 주입)
│   ├── tab_search.html     # 🔍 노선 조회 탭
│   ├── tab_compare.html    # ⚖️ 시간 비교 탭
│   └── tab_routes.html     # ⭐ 나만의 루트 탭
│
└── static/
    ├── css/
    │   └── style.css
    └── js/
        ├── data.js         # Python → JS 데이터 전달 및 계산 함수
        ├── ui.js           # 탭·시계·드롭다운·즐겨찾기 공통 UI
        ├── search.js       # 노선 조회 로직
        ├── compare.js      # 시간 비교 로직
        └── routes.js       # 나만의 루트 CRUD
```

---

## ⚡ 실행 방법 (uv 권장)

```bash
# uv 설치 (처음 한 번만)
pip install uv

# 가상환경 생성 + 의존성 설치
uv venv
uv sync

# 가상환경 활성화
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # macOS / Linux

# 앱 실행
python app.py
# → http://localhost:5000
```

### pip 사용 (대안)

```bash
pip install -r requirements.txt
python app.py
```

---

## 🔑 환경변수 설정

```bash
cp .env.example .env   # 복사 후 값 입력
```

| 변수 | 설명 |
|------|------|
| `FLASK_SECRET_KEY` | Flask 세션 암호화 키 |
| `FLASK_DEBUG` | `1` = 개발, `0` = 운영 |
| `SEOUL_API_KEY` | 서울 열린데이터광장 API 키 |
| `STC_API_KEY` | 서울교통공사 혼잡도 API 키 |
| `GEOVISION_API_KEY` | 지오비전 실시간 혼잡도 API 키 (선택) |

---

## 🌐 API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/` | 메인 페이지 |
| GET | `/api/lines` | 전체 호선 목록 |
| GET | `/api/stations/{line}` | 호선별 역 목록 |
| GET | `/api/congestion/{line}/{hour}` | 특정 시간 혼잡도 |
| GET | `/api/congestion/{line}/all` | 5~23시 전체 혼잡도 |

---

## 🔄 실시간 API 연동

`data/congestion.py`의 `get_congestion_pct()` 함수만 교체하면 됩니다.

---

## 📊 데이터 출처

서울교통공사 1~8호선 30분 단위 평균 혼잡도 통계 기반  
https://data.seoul.go.kr/dataList/OA-12928/F/1/datasetView.do
