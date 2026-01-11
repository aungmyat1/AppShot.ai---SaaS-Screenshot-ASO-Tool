from __future__ import annotations

import math
import time
from collections import defaultdict, deque


class MetricsStore:
    """
    Lightweight in-process latency store (suitable scaffold).
    Keeps last N latencies per route for p50/p95/p99.
    """

    def __init__(self, max_samples: int = 2000):
        self.max_samples = max_samples
        self._latencies: dict[str, deque[float]] = defaultdict(lambda: deque(maxlen=max_samples))
        self._counts: dict[str, int] = defaultdict(int)
        self._errors: dict[str, int] = defaultdict(int)

    def observe(self, key: str, latency_ms: float, is_error: bool):
        self._latencies[key].append(latency_ms)
        self._counts[key] += 1
        if is_error:
            self._errors[key] += 1

    def snapshot(self):
        out = {}
        for key, samples in self._latencies.items():
            arr = sorted(samples)
            out[key] = {
                "count": self._counts[key],
                "errors": self._errors[key],
                "p50_ms": _pct(arr, 0.50),
                "p95_ms": _pct(arr, 0.95),
                "p99_ms": _pct(arr, 0.99),
            }
        return {"ts": time.time(), "routes": out}


def _pct(sorted_values: list[float], p: float) -> float | None:
    if not sorted_values:
        return None
    idx = int(math.ceil(p * len(sorted_values))) - 1
    idx = max(0, min(idx, len(sorted_values) - 1))
    return sorted_values[idx]


metrics = MetricsStore()

