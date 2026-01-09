from __future__ import annotations

from typing import Dict, Set

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self._topics: Dict[str, Set[WebSocket]] = {}

    async def connect(self, topic: str, ws: WebSocket):
        await ws.accept()
        self._topics.setdefault(topic, set()).add(ws)

    def disconnect(self, topic: str, ws: WebSocket):
        if topic in self._topics:
            self._topics[topic].discard(ws)

    async def broadcast(self, topic: str, message: dict):
        conns = list(self._topics.get(topic, set()))
        for ws in conns:
            try:
                await ws.send_json(message)
            except Exception:
                self.disconnect(topic, ws)


manager = ConnectionManager()

