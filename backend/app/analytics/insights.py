"""Deterministic findings contain inspectable evidence, never invented causes."""


def generate_insights(columns: list[dict], quality: dict, charts: list[dict], pairs: list[dict]) -> list[dict]:
    findings = []

    def add(kind: str, importance: float, title: str, description: str, evidence: dict) -> None:
        findings.append({"type": kind, "importance": round(min(100, importance), 1), "title": title, "description": description, "evidence": evidence})

    for column in columns:
        if column["missing_rate"] >= .05:
            add("data_quality", 70 + 25 * column["missing_rate"], f"Missing values in {column['name']}",
                f"{column['missing_rate']:.1%} of original records have no value in this field.", {"column": column["name"], "missing_rate": column["missing_rate"]})
        stats = column.get("stats")
        if stats and stats["count"]:
            add("distribution", 40, f"Typical {column['name']}", f"Median {stats['median']:,.3g}; middle 50% ranges from {stats['q25']:,.3g} to {stats['q75']:,.3g}.", {"column": column["name"], **stats})
        top = column.get("top_values", [])
        if top and top[0]["share"] >= .3:
            add("segment", 55 + 20 * top[0]["share"], f"{column['name']} is concentrated", f"“{top[0]['value']}” accounts for {top[0]['share']:.1%} of records.", {"column": column["name"], **top[0]})
    if quality["duplicates"]:
        add("data_quality", 85, "Repeated records", f"Found {quality['duplicates']:,} duplicate rows. Check whether these represent legitimate repeated events before removing them.", {"duplicate_rows": quality["duplicates"]})
    for pair in pairs:
        if abs(pair["spearman"]) >= .6:
            add("correlation", 65 + 25 * abs(pair["spearman"]), f"{pair['x']} and {pair['y']} move together",
                f"Pearson r = {pair['pearson']:.2f}; Spearman ρ = {pair['spearman']:.2f} across {pair['count']:,} paired observations. Correlation does not imply causation.", pair)
    for chart in charts:
        if chart["type"] == "line":
            change = chart["change"]
            if change is not None and abs(change) >= 5:
                add("trend", 70 + min(abs(change) / 4, 20), f"{chart['y']} {'increased' if change > 0 else 'decreased'} {abs(change):.1f}%",
                    f"Compared the last {chart['comparison_buckets']} completed {chart['frequency']} buckets with the preceding equally sized period. The data does not establish a cause.",
                    {"metric": chart["y"], "date": chart["x"], "change_percent": change, "buckets": chart["comparison_buckets"], "aggregation": chart["aggregation"]})
            anomalies = [p for p in chart["data"] if p["anomaly"]]
            if anomalies:
                add("anomaly", 92, f"Unusual movement in {chart['y']}", f"{len(anomalies)} time buckets cross both the preceding rolling baseline and robust 3 × IQR fences. Review these observations.", {"metric": chart["y"], "points": anomalies})
        if chart["type"] == "bar" and chart["data"] and chart["effect_size"] >= .05:
            top = chart["data"][0]
            share = top.get("share")
            description = f"“{top['x']}” has {chart['aggregation']} {top['y']:,.3g} across {int(top['count'])} observations."
            if share is not None and share == share:
                description += f" Its share of the non-negative total is {share:.1%}."
            add("segment", 60 + 30 * chart["effect_size"], f"{chart['y']} varies by {chart['x']}", description,
                {"dimension": chart["x"], "metric": chart["y"], "eta_squared": chart["effect_size"], "top_group": top})
    return sorted(findings, key=lambda f: f["importance"], reverse=True)[:10]
