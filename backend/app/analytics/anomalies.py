"""Robust, explainable outlier detection without a learned model."""
import numpy as np
import pandas as pd


def outlier_mask(values: pd.Series) -> pd.Series:
    """Use 3 × IQR fences; when IQR is zero, flag deviations from the constant center."""
    mask = pd.Series(False, index=values.index)
    finite = values.dropna()
    if len(finite) < 8:
        return mask
    q1, q3 = finite.quantile([.25, .75])
    width = q3 - q1
    if width > 0:
        return (values < q1 - 3 * width) | (values > q3 + 3 * width)
    return values.notna() & (values != finite.median())


def time_anomalies(values: pd.Series) -> pd.Series:
    """Compare against preceding seven buckets, with robust global fallback for flat baselines."""
    baseline = values.shift(1).rolling(7, min_periods=4)
    mean, std = baseline.mean(), baseline.std(ddof=0)
    z = (values - mean).abs() / std.replace(0, np.nan)
    flat_jump = std.eq(0) & values.ne(mean)
    return ((z > 3) | flat_jump).fillna(False) & outlier_mask(values)
