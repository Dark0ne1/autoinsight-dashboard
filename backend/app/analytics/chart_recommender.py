import pandas as pd

from .charts import category_chart, distribution_chart, scatter_chart, segment_chart, time_chart


def recommend(frame: pd.DataFrame, metrics: list[str], categories: list[str], date: str | None, pairs: list[dict], percentages: set[str]) -> list[dict]:
    """Rank candidates by observed group separation, correlation and temporal coverage; cap at eight."""
    candidates = []
    for index, metric in enumerate(metrics[:4]):
        method = "mean" if metric in percentages else "sum"
        if date:
            candidates.append({**time_chart(frame, date, metric, method), "importance": 86 - index})
        candidates.append({**distribution_chart(frame, metric), "importance": 54 - index})
    segments = []
    for category in categories:
        for metric in metrics[:6]:
            chart = segment_chart(frame, category, metric, "mean" if metric in percentages else "sum")
            segments.append({**chart, "importance": round(55 + 35 * chart["effect_size"], 1)})
    candidates.extend(sorted(segments, key=lambda c: c["importance"], reverse=True)[:3])
    for pair in pairs[:2]:
        candidates.append({**scatter_chart(frame, pair["x"], pair["y"]), "importance": round(50 + 35 * abs(pair["spearman"]), 1)})
    for category in categories[:2]:
        candidates.append({**category_chart(frame, category), "importance": 50})
    ranked = sorted(candidates, key=lambda c: c["importance"], reverse=True)
    # Keep at least one distribution when metrics exist, rather than only pairwise charts.
    selected = ranked[:8]
    if metrics and not any(c["type"] == "histogram" for c in selected):
        histogram = next(c for c in ranked if c["type"] == "histogram")
        selected = selected[:7] + [histogram]
    return selected
