import time
from collections import defaultdict
from typing import Dict, List
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

class RateLimiterMiddleware(BaseHTTPMiddleware):
    """
    Sliding window IP-based rate limiter:
    - /api/auth/login: max 8 attempts / 15 mins
    - /api/orders/guest: max 15 requests / 10 mins
    - /api: max 300 requests / 15 mins
    """
    def __init__(self, app):
        super().__init__(app)
        self.auth_attempts: Dict[str, List[float]] = defaultdict(list)
        self.order_attempts: Dict[str, List[float]] = defaultdict(list)
        self.global_requests: Dict[str, List[float]] = defaultdict(list)

    def _cleanup_and_check(self, history: List[float], max_count: int, window_sec: float) -> bool:
        now = time.time()
        # Keep only timestamps within window
        valid = [t for t in history if now - t < window_sec]
        history.clear()
        history.extend(valid)
        if len(history) >= max_count:
            return False
        history.append(now)
        return True

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path

        # 1. Auth Rate Limiting
        if path.startswith("/api/auth/login") and request.method == "POST":
            if not self._cleanup_and_check(self.auth_attempts[client_ip], max_count=8, window_sec=15 * 60):
                return JSONResponse(
                    status_code=429,
                    content={"error": "Too many failed login attempts. Account temporarily locked for 15 minutes."}
                )

        # 2. Guest Order Placement Velocity
        elif path.startswith("/api/orders/guest") and request.method == "POST":
            if not self._cleanup_and_check(self.order_attempts[client_ip], max_count=15, window_sec=10 * 60):
                return JSONResponse(
                    status_code=429,
                    content={"error": "Order velocity threshold reached. Please wait a few minutes before ordering again."}
                )

        # 3. Global API Limiter
        elif path.startswith("/api"):
            if not self._cleanup_and_check(self.global_requests[client_ip], max_count=300, window_sec=15 * 60):
                return JSONResponse(
                    status_code=429,
                    content={"error": "Too many requests from this IP, please try again in 15 minutes."}
                )

        return await call_next(request)
