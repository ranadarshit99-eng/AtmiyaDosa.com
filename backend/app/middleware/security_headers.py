from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.config import settings

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Enterprise-grade security headers middleware equivalent to Helmet.js
    """
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)

        # 1. Prevent MIME-sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # 2. Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"

        # 3. Restrict browser referrers
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # 4. Strict Content Security Policy
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https: blob:; "
            "connect-src 'self' https://cloud.appwrite.io http://localhost:* https://*; "
            "frame-ancestors 'none';"
        )

        # 5. Enforce HSTS (Strict-Transport-Security) in production
        if settings.is_production:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

        # 6. Hide server backend technologies
        if "server" in response.headers:
            del response.headers["server"]
        response.headers["X-Powered-By"] = "Atmiya-Shield-FastAPI"

        return response
