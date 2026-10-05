"""Reproducible marketing data with missing values, duplicates and an injected spike."""
from pathlib import Path
import csv
import random
from datetime import date, timedelta

rng = random.Random(42)
root = Path(__file__).resolve().parents[1]
target = root / "backend" / "demo" / "marketing.csv"
target.parent.mkdir(parents=True, exist_ok=True)
rows = []
for day in range(180):
    for channel, multiplier in [("Organic", 1.7), ("Paid search", 1.2), ("Social", .7), ("Email", 1.4)]:
        impressions = int(rng.uniform(3500, 9000) * (1 + day / 360))
        clicks = int(impressions * rng.uniform(.025, .07))
        leads = int(clicks * .12 * multiplier)
        orders = int(leads * rng.uniform(.18, .35))
        revenue = round(orders * rng.uniform(80, 160), 2)
        if day == 142:
            revenue *= 20
        rows.append([(date(2026, 1, 1) + timedelta(days=day)).isoformat(), f"Campaign {day % 5 + 1}", channel,
                     rng.choice(["North", "South", "West", "East"]) if rng.random() > .06 else "",
                     impressions, clicks, round(clicks * rng.uniform(.3, 1.4), 2), leads, orders, revenue])
rows.extend(rows[:8])
with target.open("w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerow(["date", "campaign", "channel", "region", "impressions", "clicks", "spend", "leads", "orders", "revenue"])
    writer.writerows(rows)
print(f"Wrote {len(rows)} demo rows to {target}")
