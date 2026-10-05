"""Local single-worker sessions, expiring after one hour with a global memory ceiling."""
import time
from dataclasses import dataclass, field
from threading import RLock
from uuid import uuid4

import pandas as pd

TTL = 3600
MEMORY_BUDGET = 512 * 1024 * 1024


@dataclass
class Dataset:
    filename: str
    content: bytes
    sheets: list[str]
    created: float = field(default_factory=time.monotonic)
    frame: pd.DataFrame | None = None
    sheet: str | None = None

    @property
    def size(self) -> int:
        return len(self.content) + (int(self.frame.memory_usage(deep=True).sum()) if self.frame is not None else 0)


class SessionStore:
    def __init__(self) -> None:
        self.items: dict[str, Dataset] = {}
        # ponytail: one lock and one process for local MVP; shared storage for multiple workers.
        self.lock = RLock()

    def expire(self) -> None:
        for key in list(self.items):
            if time.monotonic() - self.items[key].created > TTL:
                del self.items[key]

    def add(self, dataset: Dataset) -> str:
        with self.lock:
            self.expire()
            if sum(d.size for d in self.items.values()) + dataset.size > MEMORY_BUDGET or len(self.items) >= 8:
                raise ValueError("Session memory is full. Remove a dataset or wait for expiry.")
            key = uuid4().hex
            self.items[key] = dataset
            return key

    def get(self, key: str) -> Dataset:
        with self.lock:
            self.expire()
            if key not in self.items:
                raise KeyError("Dataset expired or was removed. Upload it again.")
            return self.items[key]

    def set_frame(self, key: str, frame: pd.DataFrame, sheet: str | None) -> None:
        with self.lock:
            dataset = self.get(key)
            used = sum(d.size for d in self.items.values()) - dataset.size + len(dataset.content)
            if used + int(frame.memory_usage(deep=True).sum()) > MEMORY_BUDGET:
                raise ValueError("Parsed dataset exceeds the 512 MB session memory budget.")
            dataset.frame, dataset.sheet = frame, sheet


store = SessionStore()
