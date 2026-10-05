"""Browser-test fixtures, intentionally kept under gitignored output/."""
from pathlib import Path

import numpy as np
import pandas as pd

target = Path(__file__).resolve().parents[1] / "output" / "playwright" / "fixtures"
target.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(42)
datasets = {
    "marketing": pd.DataFrame({"observed_at": pd.date_range("2026-01-01", periods=60), "source": ["A", "B"] * 30, "visits": rng.uniform(100, 500, 60), "signups": rng.uniform(10, 50, 60)}),
    "sales": pd.DataFrame({"territory": ["North", "South"] * 30, "amount": rng.uniform(10, 100, 60)}),
    "no_date": pd.DataFrame({"team": ["A", "B", "C"] * 20, "duration": rng.uniform(1, 50, 60)}),
    "missing": pd.DataFrame({"mostly_missing": [None] * 55 + [1., 2., 3., 4., 5.], "status": [None] * 50 + ["open"] * 10}),
    "numeric": pd.DataFrame({"alpha": rng.normal(size=60), "beta": rng.normal(size=60)}),
    "text": pd.DataFrame({"email": [f"person{i}@example.com" for i in range(60)], "note": ["Long free text " * 8 + str(i) for i in range(60)]}),
    "empty": pd.DataFrame({"label": pd.Series(dtype=str)}),
}
for name, frame in datasets.items():
    frame.to_csv(target / f"{name}.csv", index=False)
with pd.ExcelWriter(target / "sheets.xlsx", engine="openpyxl") as writer:
    datasets["sales"].to_excel(writer, sheet_name="Sales", index=False)
    pd.DataFrame({"note": ["hello", "world"]}).to_excel(writer, sheet_name="Notes", index=False)
print(f"Created {len(datasets)} CSV fixtures and a multi-sheet workbook in {target}")
