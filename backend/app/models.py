from typing import Literal

from pydantic import BaseModel, Field, ConfigDict


class Filter(BaseModel):
    model_config = ConfigDict(extra="forbid")
    column: str = Field(max_length=500)
    kind: Literal["categorical", "numeric", "date"]
    values: list[str] = Field(default_factory=list, max_length=100)
    min: str | float | None = None
    max: str | float | None = None


class AnalysisRequest(BaseModel):
    sheet: str | None = None
    date_column: str | None = None
    filters: list[Filter] = Field(default_factory=list, max_length=20)


class ChartRequest(AnalysisRequest):
    type: Literal["line", "bar", "histogram", "scatter", "category"]
    x: str
    y: str | None = None
    aggregation: Literal["sum", "mean", "median", "count", "min", "max"] = "sum"
    group_by: str | None = None


class RowsRequest(AnalysisRequest):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    search: str = Field(default="", max_length=200)
    sort: str | None = None
    descending: bool = False


class ExportRequest(AnalysisRequest):
    format: Literal["json", "csv", "markdown"]
