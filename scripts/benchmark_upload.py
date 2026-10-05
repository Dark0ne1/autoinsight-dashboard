"""Reproducible, opt-in CSV upload check; generated files stay under output/."""
import argparse
import csv
import json
from pathlib import Path
from time import perf_counter

import httpx

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--mb", type=int, default=50, choices=[50, 95])
parser.add_argument("--url", default="http://localhost:3000")
args = parser.parse_args()
directory = Path(__file__).resolve().parents[1] / "output" / "benchmark"
directory.mkdir(parents=True, exist_ok=True)
path = directory / f"synthetic_{args.mb}mb.csv"
target_bytes = args.mb * 1024 * 1024
row_count = 0
with path.open("w", encoding="utf-8", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["record_id", "observed_at", "segment", "measurement", "quantity", "description"])
    while file.tell() < target_bytes - 1200:
        row_count += 1
        writer.writerow([f"K{row_count:08}", f"2026-{1 + row_count % 6:02}-{1 + row_count % 28:02}",
                         f"Group {row_count % 7}", round((row_count % 913) * 1.217 + .31, 3),
                         round((row_count % 317) * .137 + .21, 3), "Synthetic observation " * 48 + str(row_count)])
key = None
with httpx.Client(base_url=args.url, timeout=180) as client:
    try:
        started = perf_counter()
        with path.open("rb") as file:
            uploaded = client.post("/api/upload", files={"file": (path.name, file, "text/csv")})
        uploaded.raise_for_status()
        upload_seconds = perf_counter() - started
        key = uploaded.json()["id"]
        started = perf_counter()
        analyzed = client.post(f"/api/datasets/{key}/analyze", json={})
        analyzed.raise_for_status()
        analysis_seconds = perf_counter() - started
        report = analyzed.json()
        assert report["overview"]["rows"] == row_count
        result = {"input_mib": round(path.stat().st_size / 1024 / 1024, 2), "rows": row_count,
                  "columns": 6, "upload_parse_seconds": round(upload_seconds, 2),
                  "analysis_seconds": round(analysis_seconds, 2),
                  "normalized_frame_mib": round(report["overview"]["memory_bytes"] / 1024 / 1024, 2),
                  "charts": len(report["charts"]), "correlation_sampled": report["analysis_scope"]["correlation_sampled"],
                  "url": args.url}
        (directory / f"result_{args.mb}mb.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
        print(json.dumps(result, indent=2))
    finally:
        if key:
            client.delete(f"/api/datasets/{key}")
