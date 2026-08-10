"""Lightweight in-memory, per-IP sliding-window rate limiting.

Usage (per-route dependency):

    from app.rate_limit import RateLimiter

    @router.post("/login", dependencies=[Depends(RateLimiter(times=10, seconds=60, scope="login"))])
    async def login(...): ...

Note: state is per-process. Behind a multi-instance / serverless deployment each
instance enforces the limit independently, which is still an effective brute-force
and abuse throttle for this application's scale.
"""

import threading
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

_buckets: dict = defaultdict(deque)
_lock = threading.Lock()
_MAX_TRACKED_KEYS = 10_000


def get_client_ip(request: Request) -> str:
    """Best-effort client IP resolution behind a reverse proxy (Vercel/NGINX)."""
    real_ip = request.headers.get("X-Real-IP")
    if real_ip and real_ip.strip():
        return real_ip.strip()
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded and forwarded.strip():
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _prune_stale(now: float, window: float) -> None:
    """Drop empty/expired buckets so the map cannot grow unbounded."""
    if len(_buckets) <= _MAX_TRACKED_KEYS:
        return
    stale = [key for key, q in _buckets.items() if not q or now - q[-1] > window]
    for key in stale:
        _buckets.pop(key, None)


class RateLimiter:
    """FastAPI dependency enforcing `times` requests per `seconds` per client IP."""

    def __init__(self, times: int, seconds: float, scope: str,
                 detail: str = "Too many requests. Please slow down and try again shortly."):
        self.times = times
        self.seconds = seconds
        self.scope = scope
        self.detail = detail

    async def __call__(self, request: Request) -> None:
        ip = get_client_ip(request)
        key = (self.scope, ip)
        now = time.monotonic()
        with _lock:
            bucket = _buckets[key]
            while bucket and now - bucket[0] >= self.seconds:
                bucket.popleft()
            if len(bucket) >= self.times:
                retry_after = max(1, int(self.seconds - (now - bucket[0])) + 1)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=self.detail,
                    headers={"Retry-After": str(retry_after)},
                )
            bucket.append(now)
            _prune_stale(now, self.seconds)
