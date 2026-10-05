import json
import os
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response

from app.analytics.charts import category_chart, distribution_chart, scatter_chart, segment_chart, time_chart
from app.analytics.profiling import profile
from app.analytics.semantic_types import METRICS, DIMENSIONS
from app.models import AnalysisRequest, ChartRequest, ExportRequest, RowsRequest
from app.services.analysis import analyze, apply_filters, json_safe
from app.services.ingestion import read_table, workbook_sheets
from app.services.sessions import Dataset, store

router = APIRouter(prefix="/api")
MAX_FILE_BYTES = int(os.getenv("MAX_UPLOAD_MB", "100")) * 1024 * 1024


def load_frame(key: str, request: AnalysisRequest) -> tuple[Dataset, pd.DataFrame]:
    dataset = store.get(key)
    sheet = request.sheet or (dataset.sheets[0] if dataset.sheets else None)
    with store.lock:
        if dataset.frame is None or dataset.sheet != sheet:
            frame = read_table(dataset.content, dataset.filename, sheet)
            store.set_frame(key, frame, sheet)
        return dataset, dataset.frame


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


@router.post("/upload")
async def upload(file: UploadFile = File(...)) -> dict:
    filename = Path((file.filename or "").replace("\\", "/")).name
    if Path(filename).suffix.lower() not in {".csv", ".xlsx"}:
        await file.close()
        raise HTTPException(415, "Only CSV and XLSX files are supported.")
    chunks, size = [], 0
    try:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            if size > MAX_FILE_BYTES:
                raise HTTPException(413, "File exceeds the upload size limit.")
            chunks.append(chunk)
    finally:
        await file.close()
    content = b"".join(chunks)
    if not content:
        raise HTTPException(422, "File is empty.")
    sheets = workbook_sheets(content) if filename.lower().endswith(".xlsx") else []
    dataset = Dataset(filename, content, sheets)
    if not sheets:
        dataset.frame = read_table(content, filename)
    key = store.add(dataset)
    return {"id": key, "filename": filename, "size": size, "sheets": sheets}


@router.post("/demo")
def demo() -> dict:
    path = Path(__file__).resolve().parents[1] / "demo" / "marketing.csv"
    content = path.read_bytes()
    dataset = Dataset(path.name, content, [], frame=read_table(content, path.name))
    key = store.add(dataset)
    return {"id": key, "filename": "marketing.csv", "size": len(content), "sheets": []}


@router.delete("/datasets/{key}")
def remove(key: str) -> dict:
    with store.lock:
        store.items.pop(key, None)
    return {"removed": True}


@router.post("/datasets/{key}/analyze")
def analysis(key: str, request: AnalysisRequest) -> dict:
    dataset, frame = load_frame(key, request)
    result, _ = analyze(frame, [f.model_dump() for f in request.filters], request.date_column)
    return {**result, "filename": dataset.filename, "file_size": len(dataset.content), "sheet": dataset.sheet}


@router.post("/datasets/{key}/chart")
def chart(key: str, request: ChartRequest) -> dict:
    _, raw = load_frame(key, request)
    columns, frame = profile(raw)
    frame = apply_filters(frame, [f.model_dump() for f in request.filters])
    roles = {c["name"]: c["semantic_type"] for c in columns}
    if request.x not in roles or (request.y and request.y not in roles) or (request.group_by and request.group_by not in roles):
        raise ValueError("Choose existing columns.")
    if request.group_by and request.type != "scatter":
        raise ValueError("Group by is supported on scatter plots; use X as the grouping field for bars.")
    if request.type in {"line", "bar", "scatter"} and roles.get(request.y) not in METRICS:
        raise ValueError("Y must be a numeric metric.")
    if request.type == "line":
        if roles[request.x] != "datetime":
            raise ValueError("Line charts require a datetime X.")
        result = time_chart(frame, request.x, request.y, request.aggregation)
    elif request.type == "bar":
        if roles[request.x] not in DIMENSIONS | {"text", "identifier"}:
            raise ValueError("Bar charts require a categorical X.")
        result = segment_chart(frame, request.x, request.y, request.aggregation)
    elif request.type == "histogram":
        if roles[request.x] not in METRICS:
            raise ValueError("Histograms require a numeric X.")
        result = distribution_chart(frame, request.x)
    elif request.type == "scatter":
        if roles[request.x] not in METRICS:
            raise ValueError("Scatter plots require a numeric X.")
        result = scatter_chart(frame, request.x, request.y, request.group_by)
    else:
        result = category_chart(frame, request.x)
    return json_safe(result)


@router.post("/datasets/{key}/rows")
def rows(key: str, request: RowsRequest) -> dict:
    _, raw = load_frame(key, request)
    _, frame = profile(raw)
    frame = apply_filters(frame, [f.model_dump() for f in request.filters])
    if request.search:
        matches = pd.Series(False, index=frame.index)
        for column in frame.columns:
            matches |= frame[column].astype(str).str.contains(request.search, case=False, regex=False, na=False)
        frame = frame[matches]
    if request.sort:
        if request.sort not in frame:
            raise ValueError("Unknown sort column.")
        frame = frame.sort_values(request.sort, ascending=not request.descending, na_position="last", key=lambda s: s.astype(str) if s.dtype == object else s)
    start = (request.page - 1) * request.page_size
    return json_safe({"total": len(frame), "columns": list(frame.columns), "rows": frame.iloc[start:start + request.page_size].astype(object).where(pd.notna(frame.iloc[start:start + request.page_size]), None).to_dict(orient="records")})


def safe_csv(frame: pd.DataFrame) -> str:
    """Neutralize formula injection in string cells, preserving legitimate numeric negatives."""
    clean = frame.drop_duplicates().copy()
    for column in clean.select_dtypes(include=["object", "string"]):
        clean[column] = clean[column].map(lambda v: "'" + v if isinstance(v, str) and v.lstrip().startswith(("=", "+", "-", "@", "\t", "\r")) else v)
    clean.columns = ["'" + c if c.lstrip().startswith(("=", "+", "-", "@")) else c for c in clean.columns]
    return clean.to_csv(index=False)


@router.post("/datasets/{key}/export")
def export(key: str, request: ExportRequest) -> Response:
    dataset, raw = load_frame(key, request)
    result, frame = analyze(raw, [f.model_dump() for f in request.filters], request.date_column)
    if request.format == "csv":
        content, extension, media = safe_csv(frame), "csv", "text/csv"
    elif request.format == "json":
        content = json.dumps({"summary": result["summary"], "analysis_scope": result["analysis_scope"], "filters": [f.model_dump() for f in request.filters], "insights": result["insights"]}, ensure_ascii=False, indent=2)
        extension, media = "json", "application/json"
    else:
        sections = ["# AutoInsight analysis", "", f"Source: {dataset.filename}", "", result["summary"], "", f"Data quality: {result['quality']['score']}/100", "", f"Filters: {json.dumps([f.model_dump() for f in request.filters])}", "", result["analysis_scope"]["notes"], "", "## Key insights", ""]
        for insight in result["insights"]:
            sections.extend([f"### {insight['title']}", insight["description"], "", "Evidence:", "```json", json.dumps(insight["evidence"], ensure_ascii=False, indent=2), "```", ""])
        content, extension, media = "\n".join(sections), "md", "text/markdown"
    return Response(content, media_type=media, headers={"Content-Disposition": f'attachment; filename="autoinsight.{extension}"'})
