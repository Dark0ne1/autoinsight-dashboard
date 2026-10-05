"""Infer roles from values first, using names only as supporting ID evidence."""
import re
import warnings

import numpy as np
import pandas as pd

METRICS = {"numeric", "percentage", "currency-like"}
DIMENSIONS = {"categorical", "boolean", "high-cardinality category"}


def parse_dates(values: pd.Series) -> pd.Series:
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", UserWarning)
        return pd.to_datetime(values, format="mixed", errors="coerce", utc=True)


def infer_column(series: pd.Series) -> tuple[dict, pd.Series]:
    """Return metadata and normalized values; never turn numeric IDs into metrics."""
    values = series.dropna()
    sample = values.head(2000).astype(str).str.strip()
    name = str(series.name)
    unique = int(values.nunique())
    ratio = unique / max(len(values), 1)
    missing = float(series.isna().mean()) if len(series) else 0.0
    flags = []
    if missing >= .8:
        flags.append("mostly-null")
    if unique == 1:
        flags.append("constant")
    kind, normalized = "text", series.copy()
    lower = sample.str.lower()
    id_name = bool(re.search(r"(^|[_\s-])(id|uuid|guid|identifier|code|артикул|код)([_\s-]|$)", name.lower()))
    uuid = sample.str.fullmatch(r"[0-9a-fA-F]{8}-(?:[0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}").mean() if len(sample) else 0
    date_shape = sample.str.match(r"^(?:\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[./-]\d{1,2}[./-]\d{4})").mean() if len(sample) else 0
    percent = sample.str.endswith("%").mean() if len(sample) else 0
    currency = sample.str.contains(r"[$€£₽]|\b(?:USD|EUR|RUB)\b", regex=True, case=False).mean() if len(sample) else 0
    if len(values) == 0:
        kind = "text"
    elif id_name or uuid >= .9:
        kind = "identifier"
    elif pd.api.types.is_bool_dtype(series) or (len(lower) and lower.isin(["true", "false", "yes", "no", "да", "нет"]).all()):
        kind = "boolean"
        normalized = series.astype("string").str.lower().map({"true": True, "yes": True, "да": True, "false": False, "no": False, "нет": False})
    elif pd.api.types.is_datetime64_any_dtype(series) or date_shape >= .8:
        parsed = parse_dates(series)
        if parsed.notna().sum() / max(len(values), 1) >= .8:
            kind, normalized = "datetime", parsed
            if not pd.api.types.is_datetime64_any_dtype(series):
                flags.append("inferred-date")
    if kind == "text" and len(values):
        cleaned = series.astype("string").str.strip().str.replace(r"[$€£₽%]|(?i:USD|EUR|RUB)|[\s\u00a0]", "", regex=True)
        # A comma without a dot is interpreted as a decimal separator, never guessed as thousands.
        cleaned = cleaned.str.replace(",", ".", regex=False)
        parsed = pd.to_numeric(cleaned, errors="coerce").replace([np.inf, -np.inf], np.nan)
        parse_rate = parsed.notna().sum() / max(len(values), 1)
        if parse_rate >= .85:
            kind = "percentage" if percent >= .8 else "currency-like" if currency >= .8 else "numeric"
            normalized = parsed.astype(float)
            if kind == "percentage":
                normalized /= 100
            if parse_rate < 1:
                flags.append("mixed-values")
        elif unique <= 50 and (ratio <= .5 or len(values) <= 50):
            kind = "categorical"
        elif ratio > .5 and sample.str.len().mean() <= 60:
            kind = "high-cardinality category"
    if kind in METRICS and unique >= 20 and ratio >= .98:
        numeric = normalized.dropna()
        # Consecutive integer sequences are usually row keys, unlike unique measured floats.
        ordered = np.sort(numeric.unique())
        if len(ordered) > 1 and np.all(ordered == np.floor(ordered)) and np.all(np.diff(ordered) == 1):
            kind, normalized = "identifier", series.copy()
    return {"name": name, "dtype": str(series.dtype), "semantic_type": kind, "flags": flags,
            "missing_rate": missing, "unique": unique, "cardinality_ratio": ratio}, normalized
