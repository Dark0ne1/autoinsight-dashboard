"""Shared automatic and manual chart computation."""
import numpy as np
import pandas as pd

from .anomalies import time_anomalies

AGGREGATIONS = {"sum", "mean", "median", "count", "min", "max"}


def aggregate(values: pd.Series, method: str) -> float:
    return values.sum(min_count=1) if method == "sum" else getattr(values, method)()


def time_chart(frame: pd.DataFrame, date: str, metric: str, method: str = "sum") -> dict:
    data = frame[[date, metric]].dropna(subset=[date]).sort_values(date)
    span = (data[date].max() - data[date].min()).days if len(data) else 0
    frequency, label = ("MS", "month") if span > 730 else ("W-MON", "week") if span > 90 else ("D", "day")
    grouped = data.set_index(date)[metric].resample(frequency)
    values = grouped.sum(min_count=1) if method == "sum" else getattr(grouped, method)()
    flags = time_anomalies(values)
    rolling = values.rolling(7, min_periods=1).mean()
    points = [{"x": index.isoformat(), "y": value, "rolling": rolling.loc[index], "anomaly": bool(flags.loc[index])} for index, value in values.items()]
    # Compare two equally sized sets of completed calendar buckets; omit newest bucket (possibly partial).
    completed = values.iloc[:-1]
    half = min(len(completed) // 2, 12)
    change = None
    if half and completed.iloc[-2 * half:].notna().all():
        prior = aggregate(completed.iloc[-2 * half:-half], method)
        recent = aggregate(completed.iloc[-half:], method)
        if prior != 0 and np.isfinite(prior) and np.isfinite(recent):
            change = float((recent - prior) / abs(prior) * 100)
    return {"type": "line", "x": date, "y": metric, "aggregation": method, "frequency": label,
            "title": f"{metric} over time", "data": points, "change": change, "comparison_buckets": half,
            "comparison_note": "Equal consecutive completed buckets; newest bucket excluded. Missing buckets prevent comparison."}


def segment_chart(frame: pd.DataFrame, category: str, metric: str, method: str = "sum") -> dict:
    paired = frame.dropna(subset=[category, metric])
    grouped = paired.groupby(category, observed=True)[metric]
    table = grouped.agg(["count", "sum", "mean", "median"])
    if method not in table:
        table[method] = getattr(grouped, method)()
    total = frame[metric].sum(min_count=1)
    table["share"] = table["sum"] / total if total > 0 and (frame[metric].dropna() >= 0).all() else np.nan
    variance = paired[metric].var(ddof=0)
    grand_mean = paired[metric].mean()
    between = ((table["mean"] - grand_mean) ** 2 * table["count"]).sum() / max(table["count"].sum(), 1)
    effect = float(np.clip(between / variance, 0, 1)) if variance > 0 else 0.0
    table = table.sort_values(method, ascending=False).head(12)
    points = [{"x": str(index), "y": row[method], **row.to_dict()} for index, row in table.iterrows()]
    return {"type": "bar", "x": category, "y": metric, "aggregation": method,
            "title": f"{metric} by {category}", "effect_size": effect, "data": points}


def distribution_chart(frame: pd.DataFrame, metric: str) -> dict:
    values = frame[metric].dropna().to_numpy(dtype=float)
    counts, edges = np.histogram(values, bins=min(20, max(1, int(np.sqrt(len(values)))))) if len(values) else ([], [])
    points = [{"x": f"{edges[i]:.3g}–{edges[i + 1]:.3g}", "y": int(n)} for i, n in enumerate(counts)]
    return {"type": "histogram", "x": metric, "y": None, "aggregation": "count", "title": f"Distribution of {metric}", "data": points}


def category_chart(frame: pd.DataFrame, category: str) -> dict:
    counts = frame[category].dropna().astype(str).value_counts().head(12)
    return {"type": "category", "x": category, "y": None, "aggregation": "count", "title": f"Most frequent {category}",
            "data": [{"x": x, "y": int(y)} for x, y in counts.items()]}


def scatter_chart(frame: pd.DataFrame, x: str, y: str, group: str | None = None) -> dict:
    names = list(dict.fromkeys([x, y] + ([group] if group else [])))
    data = frame[names].dropna(subset=[x, y])
    if len(data) > 1000:
        data = data.sample(1000, random_state=42)
    return {"type": "scatter", "x": x, "y": y, "aggregation": "none", "title": f"{y} vs {x}",
            "data": [{"x": row[x], "y": row[y], "group": str(row[group]) if group else "All"} for _, row in data.iterrows()],
            "sampled": len(frame) > 1000}
