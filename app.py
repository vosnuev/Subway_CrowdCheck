"""
app.py  ―  Subway_CrowdCheck_app
Flask 앱 진입점: 라우팅 + JSON API 제공
"""

import json
import os
from flask import Flask, render_template, jsonify
from dotenv import load_dotenv

# .env 파일 로드 (없으면 무시)
load_dotenv()

from data import (
    LINE_META, STATIONS,
    PATTERNS, LINE_PATTERN,
    get_congestion_pct, cong_level, find_best_hour,
)

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-change-in-production")


# ─────────────────────────────────────────────
#  메인 페이지
# ─────────────────────────────────────────────
@app.route("/")
def index():
    """메인 페이지: 탭 3개(노선조회 / 시간비교 / 나만의 루트) 렌더링"""
    return render_template(
        "base.html",
        # Python 데이터를 JSON 직렬화하여 템플릿에 전달 → JS에서 사용
        line_meta_json=json.dumps(LINE_META, ensure_ascii=False),
        stations_json=json.dumps(STATIONS, ensure_ascii=False),
        patterns_json=json.dumps(PATTERNS, ensure_ascii=False),
        line_pattern_json=json.dumps(LINE_PATTERN, ensure_ascii=False),
    )


# ─────────────────────────────────────────────
#  API: 단일 역 혼잡도 조회
# ─────────────────────────────────────────────
@app.route("/api/congestion/<line>/<int:hour>")
def api_congestion(line: str, hour: int):
    """
    GET /api/congestion/{line}/{hour}
    예) /api/congestion/7/8  → 7호선 8시 혼잡도
    """
    if line not in LINE_META:
        return jsonify({"error": "존재하지 않는 호선입니다."}), 404
    if not (5 <= hour <= 23):
        return jsonify({"error": "hour는 5~23 사이여야 합니다."}), 400

    pct = get_congestion_pct(line, hour)
    lv  = cong_level(pct)
    best_h = find_best_hour(line, hour)
    best_pct = get_congestion_pct(line, best_h)

    return jsonify({
        "line":      line,
        "line_name": LINE_META[line]["name"],
        "hour":      hour,
        "pct":       pct,
        "level":     lv,
        "best_hour": best_h,
        "best_pct":  best_pct,
    })


# ─────────────────────────────────────────────
#  API: 전체 시간대 혼잡도 (5~23시)
# ─────────────────────────────────────────────
@app.route("/api/congestion/<line>/all")
def api_congestion_all(line: str):
    """
    GET /api/congestion/{line}/all
    해당 호선의 5~23시 전체 혼잡도 배열 반환
    """
    if line not in LINE_META:
        return jsonify({"error": "존재하지 않는 호선입니다."}), 404

    hourly = [
        {"hour": h, "pct": get_congestion_pct(line, h), "level": cong_level(get_congestion_pct(line, h))}
        for h in range(5, 24)
    ]
    return jsonify({"line": line, "line_name": LINE_META[line]["name"], "hourly": hourly})


# ─────────────────────────────────────────────
#  API: 역 목록 조회
# ─────────────────────────────────────────────
@app.route("/api/stations/<line>")
def api_stations(line: str):
    """GET /api/stations/{line}  → 해당 호선 역 목록"""
    if line not in STATIONS:
        return jsonify({"error": "존재하지 않는 호선입니다."}), 404
    return jsonify({"line": line, "stations": STATIONS[line]})


# ─────────────────────────────────────────────
#  API: 호선 목록
# ─────────────────────────────────────────────
@app.route("/api/lines")
def api_lines():
    """GET /api/lines  → 전체 호선 메타 정보"""
    return jsonify(LINE_META)


# ─────────────────────────────────────────────
#  진입점
# ─────────────────────────────────────────────
if __name__ == "__main__":
    host  = os.getenv("HOST", "127.0.0.1")
    port  = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "1") == "1"
    app.run(debug=debug, host=host, port=port)
