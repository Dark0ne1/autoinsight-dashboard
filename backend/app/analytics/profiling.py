"""Column profiles and canonical typed frame shared by filters and charts."""
import numpy as np
import pandas as pd

from .semantic_types import DIMENSIONS, METRICS, infer_column


def numeric_stats(values: pd.Series) -> dict:
    finite = values.replace([np.inf, -np.inf], np.nan).dropna()
    return {"count": int(len(finite)), "mean": finite.mean(), "median": finite.median(),
            "min": finite.min(), "max": finite.max(), "std": finite.std(),
            "q05": finite.quantile(.05), "q25": finite.quantile(.25),
            "q75": finite.quantile(.75), "q95": finite.quantile(.95)}


def profile(frame: pd.DataFrame) -> tuple[list[dict], pd.DataFrame]:
    columns, normalized = [], frame.copy()
    for name in frame.columns:
        meta, normalized[name] = infer_column(frame[name])
        values = normalized[name]
        meta["normalized_missing_rate"] = float(values.isna().mean()) if len(values) else 0
        if meta["semantic_type"] in METRICS:
            meta["stats"] = numeric_stats(values)
        if meta["semantic_type"] in DIMENSIONS or meta["semantic_type"] == "text":
            counts = values.dropna().astype(str).value_counts()
            top = counts.head(10)
            meta["top_values"] = [{"value": v, "count": int(n), "share": float(n / max(len(values), 1))} for v, n in top.items()]
            meta["long_tail_share"] = float(counts.iloc[10:].sum() / max(len(values), 1))
        columns.append(meta)
    return columns, normalized
