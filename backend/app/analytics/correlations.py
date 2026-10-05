from itertools import combinations

import pandas as pd
from scipy.stats import pearsonr, spearmanr


def correlations(frame: pd.DataFrame, metrics: list[str]) -> list[dict]:
    """Rank effect sizes with paired observations; no causality or significance claims."""
    pairs = []
    for x, y in combinations(metrics, 2):
        data = frame[[x, y]].dropna()
        if len(data) < 10 or data[x].nunique() < 2 or data[y].nunique() < 2:
            continue
        pearson = float(pearsonr(data[x], data[y]).statistic)
        spearman = float(spearmanr(data[x], data[y]).statistic)
        pairs.append({"x": x, "y": y, "pearson": pearson, "spearman": spearman, "count": len(data)})
    return sorted(pairs, key=lambda p: abs(p["spearman"]), reverse=True)[:5]
