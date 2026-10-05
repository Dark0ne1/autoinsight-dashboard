import pandas as pd

from .anomalies import outlier_mask
from .semantic_types import METRICS


def quality(frame: pd.DataFrame, columns: list[dict]) -> dict:
    """100 minus weighted missing, duplicate, constant, coercion and extreme-outlier rates."""
    issues = []
    size = max(frame.size, 1)
    missing_rate = float(frame.isna().sum().sum() / size)
    duplicates = int(frame.duplicated().sum())
    constants = sum("constant" in c["flags"] for c in columns)
    coercions, outliers, numeric_cells = 0, 0, 0
    for column in columns:
        name = column["name"]
        if column["missing_rate"]:
            issues.append({"column": name, "kind": "missing", "message": f"{name}: {column['missing_rate']:.1%} missing values."})
        if "constant" in column["flags"]:
            issues.append({"column": name, "kind": "constant", "message": f"{name} contains only one distinct non-null value."})
        lost = max(0, column["normalized_missing_rate"] - column["missing_rate"])
        coercions += lost * len(frame)
        if lost:
            issues.append({"column": name, "kind": "mixed-values", "message": f"{name}: {lost:.1%} values could not be converted and became missing."})
        if "inferred-date" in column["flags"]:
            issues.append({"column": name, "kind": "inferred-date", "message": f"{name} contains dates imported as text; normalized to UTC."})
        if column["semantic_type"] in METRICS:
            count = int(outlier_mask(frame[name]).sum())
            outliers += count
            numeric_cells += int(frame[name].notna().sum())
            if count:
                issues.append({"column": name, "kind": "outlier", "message": f"{name} contains {count} extreme outliers (3 × IQR)."})
    if duplicates:
        issues.append({"column": None, "kind": "duplicate", "message": f"Found {duplicates} duplicate rows."})
    penalties = {"missing": 40 * missing_rate, "duplicates": 25 * duplicates / max(len(frame), 1),
                 "constants": 10 * constants / max(len(columns), 1), "coercion": 15 * coercions / size,
                 "outliers": 10 * outliers / max(numeric_cells, 1)}
    return {"score": round(max(0, 100 - sum(penalties.values())), 1) if len(frame) else 0,
            "missing_cells": int(frame.isna().sum().sum()), "missing_rate": missing_rate,
            "duplicates": duplicates, "issues": issues, "penalties": penalties}
