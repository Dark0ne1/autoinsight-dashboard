from io import BytesIO
import unittest

import pandas as pd
from fastapi.testclient import TestClient

from app.main import app
from app.services.sessions import store
from app.services.ingestion import read_table


class APITests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app, raise_server_exceptions=False)
        store.items.clear()

    def test_csv_end_to_end_filters_rows_manual_chart_exports(self):
        content = "id,group,amount\n0001,A,2.5\n0002,B,5.5\n0003,A,4.5\n"
        response = self.client.post("/api/upload", files={"file": ("sales.csv", content, "text/csv")})
        self.assertEqual(response.status_code, 200, response.text)
        key = response.json()["id"]
        query = {"filters": [{"kind": "categorical", "column": "group", "values": ["A"]}]}
        response = self.client.post(f"/api/datasets/{key}/analyze", json=query)
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.json()["overview"]["rows"], 2)
        rows = self.client.post(f"/api/datasets/{key}/rows", json={**query, "sort": "amount", "descending": True}).json()
        self.assertEqual(rows["rows"][0]["amount"], 4.5)
        self.assertEqual(rows["rows"][0]["id"], "0003")
        chart = self.client.post(f"/api/datasets/{key}/chart", json={**query, "type": "bar", "x": "group", "y": "amount", "aggregation": "sum"})
        self.assertEqual(chart.status_code, 200, chart.text)
        self.assertEqual(chart.json()["data"][0]["y"], 7)
        for format_name in ["json", "csv", "markdown"]:
            export = self.client.post(f"/api/datasets/{key}/export", json={**query, "format": format_name})
            self.assertEqual(export.status_code, 200, export.text)
            self.assertIn("attachment", export.headers["content-disposition"])
        self.assertEqual(self.client.delete(f"/api/datasets/{key}").status_code, 200)
        self.assertEqual(self.client.post(f"/api/datasets/{key}/analyze", json={}).status_code, 404)

    def test_xlsx_sheet_selection(self):
        buffer = BytesIO()
        with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
            pd.DataFrame({"region": ["A", "B"], "sales": [2.5, 3.5]}).to_excel(writer, sheet_name="Sales", index=False)
            pd.DataFrame({"note": ["hello"]}).to_excel(writer, sheet_name="Notes", index=False)
        upload = self.client.post("/api/upload", files={"file": ("book.xlsx", buffer.getvalue())})
        self.assertEqual(upload.status_code, 200, upload.text)
        self.assertEqual(upload.json()["sheets"], ["Sales", "Notes"])
        key = upload.json()["id"]
        response = self.client.post(f"/api/datasets/{key}/analyze", json={"sheet": "Notes"})
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.json()["overview"]["columns"], 1)
        self.assertEqual(self.client.post(f"/api/datasets/{key}/analyze", json={"sheet": "missing"}).status_code, 422)

    def test_bad_empty_and_unsupported_files(self):
        for filename, data, code in [("code.py", "print(1)", 415), ("empty.csv", "", 422), ("broken.xlsx", "broken", 422), ("bad.csv", 'a,b\n"unclosed', 422)]:
            with self.subTest(filename=filename):
                self.assertEqual(self.client.post("/api/upload", files={"file": (filename, data)}).status_code, code)

    def test_header_only_and_single_column_csv(self):
        for csv in [b"label\n", b"label\nhello\nworld\n"]:
            frame = read_table(csv, "one.csv")
            self.assertEqual(list(frame.columns), ["label"])
        response = self.client.post("/api/upload", files={"file": ("one.csv", "label\n")})
        self.assertEqual(response.status_code, 200, response.text)

    def test_formula_injection_is_neutralized_in_cleaned_csv(self):
        from app.api import safe_csv
        csv = safe_csv(pd.DataFrame({"note": ["=SUM(A1:A2)", " @command"], "value": [-2.5, 3.5]}))
        self.assertIn("'=SUM", csv)
        self.assertIn("' @command", csv)
        self.assertIn("-2.5", csv)

    def test_large_utf8_semicolon_csv_preserves_unicode(self):
        content = ("категория;сумма\n" + "Москва;2,5\n" * 6000).encode("utf-8")
        frame = read_table(content, "unicode.csv")
        self.assertEqual(len(frame), 6000)
        self.assertEqual(list(frame.columns), ["категория", "сумма"])
        self.assertEqual(frame.iloc[-1, 0], "Москва")

    def test_request_size_limit_and_expiry(self):
        response = self.client.post("/api/upload", headers={"Content-Length": str(102 * 1024 * 1024)}, content=b"a")
        self.assertEqual(response.status_code, 413)
        upload = self.client.post("/api/demo", json={}).json()
        store.items[upload["id"]].created -= 3601
        self.assertEqual(self.client.post(f"/api/datasets/{upload['id']}/analyze", json={}).status_code, 404)

    def test_demo_and_chart_validation(self):
        upload = self.client.post("/api/demo", json={})
        self.assertEqual(upload.status_code, 200, upload.text)
        key = upload.json()["id"]
        response = self.client.post(f"/api/datasets/{key}/analyze", json={})
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(len(response.json()["charts"]), 8)
        self.assertEqual(self.client.post(f"/api/datasets/{key}/chart", json={"type": "line", "x": "channel", "y": "revenue"}).status_code, 422)


if __name__ == "__main__":
    unittest.main()
