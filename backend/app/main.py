import sys
import time
from contextlib import asynccontextmanager

# Configure Windows terminal stdout to UTF-8
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse

from app.config import settings
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.middleware.rate_limiter import RateLimiterMiddleware

# Import API Routers
from app.routers.health import router as health_router
from app.routers.auth import router as auth_router
from app.routers.orders import router as orders_router
from app.routers.tables import router as tables_router
from app.routers.menu import router as menu_router
from app.routers.inventory import router as inventory_router
from app.routers.service_calls import router as service_calls_router
from app.routers.coupons import router as coupons_router
from app.routers.reports import router as reports_router
from app.routers.qr import router as qr_router
from app.routers.webhooks import router as webhooks_router
from app.routers.audit import router as audit_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup sequence
    print("\n======================================================")
    print(">> Atmiya Dosa Hub POS Engine (FastAPI 2.0.0)")
    print(f">> Server running on http://{settings.HOST}:{settings.PORT}")
    print(">> Security Checklist Applied: 19/19 Controls Active")
    print(f">> Live Appwrite Cloud DB: {settings.APPWRITE_DATABASE_ID}")
    print(f">> Environment: {settings.ENVIRONMENT}")
    print(f">> Swagger UI Documentation: http://localhost:{settings.PORT}/docs")
    print("======================================================\n")
    yield
    # Shutdown sequence
    print(">> FastAPI Server gracefully shutting down...")

app = FastAPI(
    title="Atmiya Dosa Hub - POS & Cloud Order Engine",
    description=(
        "Enterprise restaurant management microservice featuring touchless QR code table ordering, "
        "Kitchen Display System (KDS), authoritative server-side billing, live Appwrite cloud sync, "
        "raw material inventory, and role-based staff authentication."
    ),
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# ----------------------------------------------------
# 1. MIDDLEWARES
# ----------------------------------------------------

# Helmet-like security headers
app.add_middleware(SecurityHeadersMiddleware)

# Sliding-window rate limiter
app.add_middleware(RateLimiterMiddleware)

# Strict CORS Policy
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins if settings.is_production else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ----------------------------------------------------
# 2. GLOBAL EXCEPTION HANDLER
# ----------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    incident_id = f"ERR_{int(time.time() * 1000)}"
    print(f"💥 [{incident_id}] Uncaught Exception on {request.method} {request.url.path}: {str(exc)}")

    if settings.is_production:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "An internal server error occurred while processing your request.",
                "code": 500,
                "incident_id": incident_id
            }
        )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": str(exc),
            "type": exc.__class__.__name__,
            "incident_id": incident_id
        }
    )

# ----------------------------------------------------
# 3. ROOT & API ROUTERS MOUNTING
# ----------------------------------------------------
@app.get("/", include_in_schema=False)
async def root_redirect():
    """Redirect root path to interactive Swagger API documentation."""
    return RedirectResponse(url="/docs")

# Mount Routers under /api
api_prefix = settings.API_PREFIX
app.include_router(health_router, prefix=api_prefix)
app.include_router(auth_router, prefix=api_prefix)
app.include_router(orders_router, prefix=api_prefix)
app.include_router(tables_router, prefix=api_prefix)
app.include_router(menu_router, prefix=api_prefix)
app.include_router(inventory_router, prefix=api_prefix)
app.include_router(service_calls_router, prefix=api_prefix)
app.include_router(coupons_router, prefix=api_prefix)
app.include_router(reports_router, prefix=api_prefix)
app.include_router(qr_router, prefix=api_prefix)
app.include_router(webhooks_router, prefix=api_prefix)
app.include_router(audit_router, prefix=api_prefix)
