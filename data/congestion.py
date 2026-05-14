# data/congestion.py
# 혼잡도 패턴 정의
# index 0 = 05시, index 18 = 23시 (5~23시, 19개 값)
# 단위: % (서울교통공사 통계 기반 근사값)

PATTERNS = {
    # 2호선, 9호선 등 극혼잡 노선
    "heavy":    [5, 8, 15, 35, 65, 92, 99, 90, 75, 55, 45, 43, 50, 60, 75, 90, 97, 82, 60],
    # 1호선, 4호선 등 출근 피크형
    "peak_am":  [4, 7, 12, 30, 58, 85, 95, 86, 70, 48, 38, 35, 42, 52, 65, 80, 88, 72, 50],
    # 7호선 등 퇴근 피크형
    "peak_pm":  [4, 6, 10, 20, 38, 62, 78, 70, 55, 43, 37, 38, 52, 65, 85, 94, 90, 78, 58],
    # 3호선, 5호선 등 균형형
    "balanced": [4, 7, 10, 22, 45, 68, 80, 72, 58, 44, 37, 35, 40, 48, 62, 75, 80, 70, 50],
    # 경전철, 외곽 노선 등 여유형
    "light":    [3, 5,  8, 15, 28, 45, 58, 52, 40, 30, 26, 25, 28, 35, 48, 58, 62, 52, 35],
}

# 호선 → 패턴 매핑
LINE_PATTERN = {
    "1": "peak_am",
    "2": "heavy",
    "3": "balanced",
    "4": "peak_am",
    "5": "balanced",
    "6": "light",
    "7": "peak_pm",
    "8": "light",
    "9": "heavy",
    "su": "balanced",
    "gi": "light",
    "gc": "light",
    "gb": "light",
    "ar": "balanced",
    "sd": "heavy",
    "sh": "light",
    "ui": "light",
    "si": "light",
    "gx": "balanced",
    "ui2": "light",
    "yg": "light",
    "kp": "light",
}


def get_congestion_pct(line: str, hour: int) -> int:
    """특정 호선·시간의 예상 혼잡도(%) 반환. hour: 5~23"""
    pattern_key = LINE_PATTERN.get(line, "balanced")
    pattern = PATTERNS[pattern_key]
    idx = max(0, min(18, hour - 5))
    return pattern[idx]


def cong_level(pct: int) -> dict:
    """혼잡도 % → 레벨 정보(label, bg, tx) 반환"""
    if pct < 20:
        return {"label": "여유",     "bg": "#e6f7ee", "tx": "#166534"}
    if pct < 40:
        return {"label": "보통",     "bg": "#dcfce7", "tx": "#15803d"}
    if pct < 60:
        return {"label": "혼잡",     "bg": "#fef9c3", "tx": "#854d0e"}
    if pct < 75:
        return {"label": "매우혼잡", "bg": "#ffedd5", "tx": "#9a3412"}
    if pct < 88:
        return {"label": "붐빔",     "bg": "#fee2e2", "tx": "#991b1b"}
    return         {"label": "헬게이트", "bg": "#fecaca", "tx": "#7f1d1d"}


def find_best_hour(line: str, current_hour: int) -> int:
    """해당 노선에서 가장 쾌적한 시간대 반환"""
    best_h, best_pct = current_hour, 999
    for h in range(5, 24):
        p = get_congestion_pct(line, h)
        if p < best_pct:
            best_pct = p
            best_h = h
    return best_h
