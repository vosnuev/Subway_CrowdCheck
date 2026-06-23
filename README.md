# Subway Crowd Check (지하철 혼잡도 확인)

> Hourly crowd-level predictor for Seoul subway lines, served as a Flask web app.
> (서울 지하철 호선별 시간대 혼잡도를 조회하는 Flask 웹 앱)

## 🛠️ Tech Stack (기술 스택)

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0+-000000?logo=flask&logoColor=white)
![python-dotenv](https://img.shields.io/badge/python--dotenv-1.0+-ECD53F?logo=dotenv&logoColor=black)
![uv](https://img.shields.io/badge/uv-package%20manager-DE5FE9?logo=astral&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![HTML/CSS](https://img.shields.io/badge/HTML%2FCSS-templates-E34F26?logo=html5&logoColor=white)

## ✨ Features (주요 기능)

- **Line search (노선 조회)** — Select any of 22 Seoul subway lines and a target hour (05:00–23:00) to get the predicted crowd percentage, level label, and the least-crowded hour of the day.
- **Time comparison (시간 비교)** — Compare crowd levels across multiple hours for the same line in a side-by-side view.
- **Custom route (나만의 루트)** — Build a multi-station route and view per-station crowd levels at a chosen hour.
- **REST JSON API** — Four endpoints expose line metadata, station lists, single-hour congestion, and full-day hourly arrays for programmatic use.
- **Congestion levels (혼잡도 단계)** — Six-tier labeling system: 여유 / 보통 / 혼잡 / 매우혼잡 / 붐빔 / 헬게이트 (based on Seoul Metro statistics).

## 📁 Project Structure (프로젝트 구조)

```
Subway_CrowdCheck/
├── app.py                  # Flask entry point; routing & JSON API
├── pyproject.toml          # Project metadata & uv/hatchling build config
├── requirements.txt        # Minimal pip dependency list
├── .env.example            # Environment variable template
├── data/
│   ├── __init__.py         # Public re-exports for the data package
│   ├── congestion.py       # Crowd patterns, level labels, best-hour finder
│   ├── line_meta.py        # Line names and brand colors for all 22 lines
│   └── stations.py         # Station name lists per line
├── templates/
│   ├── base.html           # Root layout; injects Python data as inline JSON
│   ├── tab_search.html     # Tab 1: single-line, single-hour lookup
│   ├── tab_compare.html    # Tab 2: multi-hour comparison view
│   └── tab_routes.html     # Tab 3: custom multi-station route builder
└── static/
    ├── css/style.css       # Shared stylesheet
    └── js/
        ├── ui.js           # Shared UI helpers & tab controller
        ├── search.js       # Logic for Tab 1 (line/hour search)
        ├── compare.js      # Logic for Tab 2 (time comparison)
        ├── routes.js       # Logic for Tab 3 (route builder)
        └── data.js         # Client-side data access helpers
```

## 🔄 Usage Flow (사용 흐름)

```
User opens browser
  └─▶ GET /                        # base.html rendered with embedded JSON data
        ├─ Tab 1: Line Search       # select line → select hour → view crowd %  & level
        ├─ Tab 2: Time Compare      # select line → compare crowd across hours
        └─ Tab 3: My Route          # add stations → select hour → view per-station crowd
```

Client-side JavaScript reads the pre-embedded JSON (no additional page loads needed).
For programmatic access, the REST API is available separately.

## 🏗️ Architecture (아키텍처)

```
┌──────────────────────────────────┐
│  Browser (HTML + JS)             │
│  - Reads inline JSON on load     │
│  - Calls /api/* for dynamic data │
└────────────┬─────────────────────┘
             │ HTTP
┌────────────▼─────────────────────┐
│  Flask app (app.py)              │
│  Routes:                         │
│    GET /                         │  → renders base.html (SSR)
│    GET /api/lines                │  → LINE_META dict
│    GET /api/stations/<line>      │  → station list for a line
│    GET /api/congestion/<line>/<hour>  → single-hour congestion + best hour
│    GET /api/congestion/<line>/all    → hourly array (05–23)
└────────────┬─────────────────────┘
             │ Python import
┌────────────▼─────────────────────┐
│  data/ package                   │
│  - line_meta.py   : LINE_META    │
│  - stations.py    : STATIONS     │
│  - congestion.py  : PATTERNS,    │
│                    LINE_PATTERN, │
│                    helpers       │
└──────────────────────────────────┘
```

Congestion values are pre-computed from Seoul Metro statistical approximations. No external API call is made at runtime; all data is served from in-memory Python structures.

## ⚙️ Environment Setup (환경 설정)

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `FLASK_ENV` | `development` | Flask environment |
| `FLASK_DEBUG` | `1` | Enable debug mode (`1` = on) |
| `FLASK_SECRET_KEY` | *(empty)* | Session secret key — set a strong value in production |
| `HOST` | `127.0.0.1` | Server bind address |
| `PORT` | `5000` | Server port |
| `SEOUL_API_KEY` | *(empty)* | Seoul Open Data Plaza API key (reserved) |
| `STC_API_KEY` | *(empty)* | Seoul Metro API key (reserved) |
| `GEOVISION_API_KEY` | *(empty)* | Geovision API key (reserved) |

## 🚀 How to Run (실행 방법)

### Using uv (recommended / 권장)

```bash
# Install uv if not already installed
pip install uv

# Install dependencies
uv sync

# Run the app
uv run python app.py
```

### Using pip

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

pip install -r requirements.txt

python app.py
```

Open `http://127.0.0.1:5000` in your browser.

### API Quick Reference (API 빠른 참조)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/lines` | All line metadata (name, color) |
| GET | `/api/stations/<line>` | Station list for a line |
| GET | `/api/congestion/<line>/<hour>` | Crowd % + level + best hour |
| GET | `/api/congestion/<line>/all` | Full hourly array (05–23) |

Example: `GET /api/congestion/2/8` → Line 2 at 08:00

## 📄 License & References (라이선스 & 참고 문서)

- Crowd pattern data: approximated from [Seoul Metro statistics](https://www.seoulmetro.co.kr)
- [Flask documentation](https://flask.palletsprojects.com/)
- [python-dotenv](https://saurabh-kumar.com/python-dotenv/)
- [uv — Python package manager](https://docs.astral.sh/uv/)
