"""Run with: python -m unittest discover -s tests -v"""
import unittest

import numpy as np
import pandas as pd

from app.analytics.anomalies import outlier_mask, time_anomalies
from app.analytics.chart_recommender import recommend
from app.analytics.data_quality import quality
from app.analytics.insights import generate_insights
from app.analytics.profiling import profile
from app.analytics.semantic_types import infer_column
from app.analytics.charts import segment_chart, time_chart
from app.services.analysis import analyze


class AnalyticsTests(unittest.TestCase):
    def test_semantic_detection(self):
        cases = [("created", ["2026-01-01", "2026-01-02"], "datetime"),
                 ("client_id", [100, 101], "identifier"),
                 ("uuid", ["abc", "def"], "identifier"),
                 ("ratio", ["12%", "20%"], "percentage"),
                 ("amount", ["$12.50", "$24.50"], "currency-like"),
                 ("enabled", ["yes", "no"], "boolean"),
                 ("segment", ["North", "South"] * 20, "categorical"),
                 ("amount", [1.5, 3.2], "numeric"),
                 ("description", ["x" * 120 + str(i) for i in range(80)], "text"),
                 ("contact", [f"person{i}@example.org" for i in range(80)], "high-cardinality category")]
        for name, values, expected in cases:
            with self.subTest(name=name, expected=expected):
                meta, _ = infer_column(pd.Series(values, name=name))
                self.assertEqual(meta["semantic_type"], expected)

    def test_profile_and_normalization(self):
        columns, frame = profile(pd.DataFrame({"rate": ["20%", "40%", None], "a": [2.5, 4.5, 6.5]}))
        self.assertAlmostEqual(frame["rate"].mean(), .3)
        self.assertEqual(columns[1]["stats"]["median"], 4.5)
        self.assertEqual(columns[0]["stats"]["count"], 2)
        self.assertAlmostEqual(columns[0]["missing_rate"], 1 / 3)

    def test_quality_formula(self):
        raw = pd.DataFrame({"metric": [1.5, 1.5, None, 4.5], "flag": ["x"] * 4})
        columns, frame = profile(raw)
        result = quality(frame, columns)
        self.assertEqual(result["duplicates"], 1)
        self.assertEqual(result["score"], 83.8)
        self.assertEqual(result["score"], round(100 - sum(result["penalties"].values()), 1))

    def test_extreme_outlier_and_time_anomaly(self):
        values = pd.Series([10.] * 20 + [500.] + [10.] * 10)
        self.assertEqual(int(outlier_mask(values).sum()), 1)
        self.assertTrue(time_anomalies(values).iloc[20])
        self.assertFalse(time_anomalies(pd.Series([10.] * 30)).any())

    def test_chart_ranking_and_segment_evidence(self):
        frame = pd.DataFrame({"group": ["A"] * 20 + ["B"] * 20, "metric": [1.5] * 20 + [20.5] * 20})
        segment = segment_chart(frame, "group", "metric")
        self.assertAlmostEqual(segment["effect_size"], 1)
        self.assertEqual(segment["data"][0]["x"], "B")
        charts = recommend(frame, ["metric"], ["group"], None, [], set())
        self.assertLessEqual(len(charts), 8)
        self.assertEqual(charts[0]["type"], "bar")
        self.assertTrue(any(c["type"] == "histogram" for c in charts))
        columns, normalized = profile(frame)
        findings = generate_insights(columns, quality(normalized, columns), charts, [])
        self.assertTrue(any(f["type"] == "segment" for f in findings))
        for finding in findings:
            self.assertTrue(finding["evidence"])
            self.assertGreaterEqual(finding["importance"], 0)
            self.assertLessEqual(finding["importance"], 100)

    def test_temporal_comparison_uses_complete_equal_buckets(self):
        frame = pd.DataFrame({"when": pd.date_range("2026-01-01", periods=9, tz="UTC"), "value": [10.] * 4 + [20.] * 4 + [999.]})
        chart = time_chart(frame, "when", "value")
        self.assertEqual(chart["comparison_buckets"], 4)
        self.assertEqual(chart["change"], 100)
        frame = frame.drop(index=2)
        self.assertIsNone(time_chart(frame, "when", "value")["change"])

    def test_segment_share_includes_missing_category_in_overall_total(self):
        frame = pd.DataFrame({"group": ["A", "B", None], "value": [10., 20., 70.]})
        chart = segment_chart(frame, "group", "value")
        self.assertAlmostEqual(chart["data"][0]["share"], .2)
        self.assertAlmostEqual(chart["effect_size"], 1)

    def test_filtered_statistics_do_not_reinfer_roles(self):
        raw = pd.DataFrame({"metric": [1.5, 2.5, 10.5, 20.5], "segment": ["A", "A", "B", "B"]})
        report, _ = analyze(raw, [{"kind": "categorical", "column": "segment", "values": ["A"]}])
        self.assertEqual(report["columns"][0]["stats"]["mean"], 2)
        self.assertEqual(report["overview"]["rows"], 2)

    def test_six_different_schemas_and_degenerate_inputs(self):
        rng = np.random.default_rng(42)
        datasets = {
            "marketing": pd.DataFrame({"time": pd.date_range("2026-01-01", periods=60).astype(str), "channel": ["A", "B"] * 30, "views": rng.normal(200, 30, 60), "conversions": rng.normal(20, 3, 60)}),
            "sales": pd.DataFrame({"territory": ["North", "South"] * 30, "amount": rng.uniform(10, 100, 60)}),
            "no_date": pd.DataFrame({"team": ["A", "B", "C"] * 20, "duration": rng.uniform(1, 50, 60)}),
            "missing": pd.DataFrame({"mostly_missing": [None] * 55 + [1., 2., 3., 4., 5.], "status": [None] * 50 + ["open"] * 10}),
            "numeric": pd.DataFrame({"alpha": rng.normal(size=60), "beta": rng.normal(size=60)}),
            "text": pd.DataFrame({"email": [f"person{i}@example.com" for i in range(60)], "note": ["Long free text " * 8 + str(i) for i in range(60)]}),
            "one_column": pd.DataFrame({"label": ["A", "B", "A"]}),
            "empty": pd.DataFrame({"label": pd.Series(dtype=str)}),
            "nonfinite": pd.DataFrame({"metric": [1.2] * 18 + [np.inf, -np.inf]}),
            "all_null": pd.DataFrame({"blank": [None] * 10}),
        }
        for name, frame in datasets.items():
            with self.subTest(schema=name):
                report, _ = analyze(frame)
                self.assertEqual(report["overview"]["rows"], len(frame))
                self.assertLessEqual(len(report["charts"]), 8)
                self.assertLessEqual(len(report["insights"]), 10)
                import json
                json.dumps(report, allow_nan=False)

    def test_filters_validate_bounds_and_include_end_date(self):
        raw = pd.DataFrame({"created": ["2026-01-01 23:00", "2026-01-02 12:00"], "metric": [2.5, 4.5]})
        result, _ = analyze(raw, [{"kind": "date", "column": "created", "max": "2026-01-01"}])
        self.assertEqual(result["overview"]["rows"], 1)
        with self.assertRaises(ValueError):
            analyze(raw, [{"kind": "numeric", "column": "metric", "min": "nan"}])

    def test_constant_numeric_fields_count_in_overview_but_not_recommendations(self):
        report, _ = analyze(pd.DataFrame({"measurement": [2.5] * 10}))
        self.assertEqual(report["overview"]["numeric"], 1)
        self.assertEqual(report["kpis"], [])
        self.assertIn("constant", report["columns"][0]["flags"])


if __name__ == "__main__":
    unittest.main()
