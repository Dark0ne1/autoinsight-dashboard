import json

import numpy as np
import pandas as pd

from app.analytics.chart_recommender import recommend
from app.analytics.correlations import correlations
from app.analytics.data_quality import quality
from app.analytics.insights import generate_insights
from app.analytics.profiling import profile, numeric_stats
from app.analytics.semantic_types import DIMENSIONS, METRICS
from .narrative import LocalNarrativeProvider


def json_safe(value: object) -> object:
    """Remove pandas/numpy scalars and non-finite floats at the JSON boundary."""
    return json.loads(json.dumps(value, default=lambda x: x.isoformat() if hasattr(x, "isoformat") else x.item() if hasattr(x, "item") else str(x), allow_nan=True),
                      parse_constant=lambda _: None)


def analyze(raw: pd.DataFrame, filters: list[dict] | None = None, date_column: str | None = None) -> tuple[dict, pd.DataFrame]:
    columns, frame = profile(raw)
    frame = apply_filters(frame, filters or [])
    # Keep inferred roles stable while recomputing statistics on the actual filtered values.
    if filters:
        for column in columns:
            values = frame[column["name"]]
            imported = raw.loc[frame.index, column["name"]]
            column["missing_rate"] = float(imported.isna().mean()) if len(frame) else 0
            column["normalized_missing_rate"] = float(values.isna().mean()) if len(frame) else 0
            column["unique"] = int(values.nunique())
            column["cardinality_ratio"] = column["unique"] / max(int(values.notna().sum()), 1)
            column["flags"] = [f for f in column["flags"] if f not in {"constant", "mostly-null"}]
            if column["unique"] == 1:
                column["flags"].append("constant")
            if column["missing_rate"] >= .8:
                column["flags"].append("mostly-null")
            if column["semantic_type"] in METRICS:
                column["stats"] = numeric_stats(values)
            if "top_values" in column:
                counts = values.dropna().astype(str).value_counts()
                column["top_values"] = [{"value": v, "count": int(n), "share": float(n / max(len(values), 1))} for v, n in counts.head(10).items()]
                column["long_tail_share"] = float(counts.iloc[10:].sum() / max(len(values), 1))
    all_metrics = [c["name"] for c in columns if c["semantic_type"] in METRICS]
    metrics = [c["name"] for c in columns if c["semantic_type"] in METRICS and "constant" not in c["flags"]]
    categories = [c["name"] for c in columns if c["semantic_type"] in DIMENSIONS and 1 < c["unique"] <= 50]
    dates = [c["name"] for c in columns if c["semantic_type"] == "datetime"]
    if date_column is not None and date_column not in dates:
        raise ValueError("Primary date must be a detected datetime column.")
    primary = date_column or (max(dates, key=lambda c: frame[c].notna().sum()) if dates else None)
    ranked_metrics = sorted(metrics, key=lambda c: (frame[c].notna().mean(), frame[c].nunique()), reverse=True)[:12]
    ranked_categories = sorted(categories, key=lambda c: frame[c].notna().mean(), reverse=True)[:8]
    sampled = len(frame) > 20000
    sample = frame.sample(20000, random_state=42) if sampled else frame
    pairs = correlations(sample, ranked_metrics)
    percentages = {c["name"] for c in columns if c["semantic_type"] == "percentage"}
    charts = recommend(frame, ranked_metrics, ranked_categories, primary, pairs, percentages)
    health = quality(frame, columns)
    findings = generate_insights(columns, health, charts, pairs)
    date_values = frame[primary].dropna() if primary else pd.Series(dtype=object)
    overview = {"rows": len(frame), "columns": len(columns), "numeric": len(all_metrics),
                "categorical": sum(c["semantic_type"] in DIMENSIONS for c in columns), "datetime": len(dates),
                "memory_bytes": int(frame.memory_usage(deep=True).sum()), "date_range": [date_values.min().isoformat(), date_values.max().isoformat()] if len(date_values) else None}
    kpis = [{"column": c, "value": frame[c].mean() if c in percentages else frame[c].sum(min_count=1),
             "aggregation": "mean" if c in percentages else "sum", "semantic_type": next(x["semantic_type"] for x in columns if x["name"] == c)} for c in ranked_metrics[:4]]
    result = {"overview": overview, "columns": columns, "quality": health, "insights": findings, "charts": charts,
              "correlations": pairs, "kpis": kpis, "primary_date": primary, "summary": LocalNarrativeProvider().summarize(overview, findings),
              "analysis_scope": {"correlation_sampled": sampled, "correlation_rows": len(sample), "metric_candidates": len(ranked_metrics),
                                 "dimension_candidates": len(ranked_categories), "notes": "Correlations: at most 12 metrics, 20,000 rows. Segments: at most 8 dimensions × 6 metrics. Scatter plots: at most 1,000 points. Profile and KPI counts use all filtered rows."}}
    return json_safe(result), frame


def apply_filters(frame: pd.DataFrame, filters: list[dict]) -> pd.DataFrame:
    for item in filters:
        column = item["column"]
        if column not in frame:
            raise ValueError(f"Unknown filter column: {column}")
        values = frame[column]
        if item["kind"] == "categorical":
            frame = frame[values.astype(str).isin(item.get("values", []))]
        else:
            is_date = item["kind"] == "date"
            if is_date and not pd.api.types.is_datetime64_any_dtype(values):
                raise ValueError("Date filters require a datetime column.")
            if not is_date and not pd.api.types.is_numeric_dtype(values):
                raise ValueError("Numeric filters require a numeric column.")
            for key, operation in [("min", "ge"), ("max", "le")]:
                bound = item.get(key)
                if bound is not None and bound != "":
                    bound = pd.to_datetime(bound, utc=True, errors="raise") if is_date else float(bound)
                    if not is_date and not np.isfinite(bound):
                        raise ValueError("Numeric bounds must be finite.")
                    if is_date and key == "max" and len(str(item[key])) == 10:
                        bound += pd.Timedelta(days=1) - pd.Timedelta(nanoseconds=1)
                    frame = frame[getattr(frame[column], operation)(bound)]
    return frame
