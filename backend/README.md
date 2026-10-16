# 🚀 Atmiya Dosa Hub - FastAPI Cloud POS & Order Engine

Enterprise-grade **Python FastAPI** microservice for restaurant operations, touchless QR code table ordering, Kitchen Display System (KDS), authoritative billing, and real-time inventory management.

---

## 🏗️ Architecture & Project Structure

The backend follows a **Clean Modular Architecture** adhering to senior software engineering standards:

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI Application entrypoint, lifespan, CORS, and middleware
│   ├── config.py                # Pydantic BaseSettings (Appwrite, JWT, CORS, Port, Secrets)
│   ├── security.py              # Bcrypt password hashing, JWT signing & decoding, HMAC verification
│   ├── database.py              # In-memory authoritative store + async Appwrite Cloud integration
│   │
│   ├── models/                  # Domain entity definitions
│   │   ├── menu.py              # MenuItem, Category
│   │   ├── table.py             # DiningTable
│   │   ├── order.py             # OrderItem, Order
│   │   ├── inventory.py         # InventoryItem
│   │   ├── employee.py          # StaffMember, ActivityLog
│   │   └── coupon.py            # Coupon
│   │
│   ├── schemas/                 # Strict Pydantic Request & Response models
│   │   ├── auth.py              # LoginRequest, TokenResponse, UserProfile
│   │   ├── order.py             # GuestOrderCreate, OrderResponse, OrderStatusUpdate
│   │   ├── table.py             # TableCreate, TableUpdate, TableResponse, ShiftTableRequest
│   │   ├── menu.py              # MenuItemCreate, MenuItemUpdate, MenuItemResponse
│   │   ├── inventory.py         # RestockRequest, InventoryItemResponse
│   │   ├── service_call.py      # ServiceCallCreate, ServiceCallResponse
│   │   ├── coupon.py            # CouponValidateRequest, CouponResponse
│   │   └── report.py            # DailySalesSummary, ZReportResponse
│   │
│   ├── routers/                 # Modular API endpoints
│   │   ├── health.py            # /api/health (Security checklist & telemetry)
│   │   ├── auth.py              # /api/auth/login, /api/auth/me
│   │   ├── orders.py            # /api/orders (Guest orders, KDS lifecycle, status update)
│   │   ├── tables.py            # /api/tables (Add table with QR, shift table, settle bill)
│   │   ├── menu.py              # /api/menu (Catalog, category filter, availability toggle)
│   │   ├── inventory.py         # /api/inventory (Raw materials, restock, low-stock alerts)
│   │   ├── service_calls.py     # /api/service-calls (Waiter, water, bill requests)
│   │   ├── coupons.py           # /api/coupons (Promo codes, server-side validation)
│   │   ├── reports.py           # /api/reports/telemetry, /api/reports/z-report
│   │   ├── qr.py                # /api/qr/{table_number} (PNG standee image & metadata)
│   │   ├── webhooks.py          # /api/webhooks/petpooja (HMAC-SHA256 signature verification)
│   │   └── audit.py             # /api/audit-logs (Staff activity audit trail)
│   │
│   └── middleware/              # Production security middlewares
│       ├── security_headers.py  # Helmet-equivalent security headers (CSP, HSTS, X-Frame-Options)
│       └── rate_limiter.py      # IP sliding-window rate limiter (Auth brute-force & spam shield)
│
├── tests/
│   └── test_api.py              # Comprehensive pytest suite testing all flows
│
├── .venv/                       # Python virtual environment
├── .env                         # Environment variables
├── requirements.txt             # Pinned dependencies
├── run.py                       # One-command server runner
└── README.md                    # System documentation
```

---

## 🔒 19/19 Security & Reliability Controls

1. **Never Trust The Frontend:** Customer guest orders submit only `{ id, qty }`. Prices, discounts, and 5% GST are recalculated authoritatively on the server.
2. **Anti-Bot & Velocity Shield:** Honeypot field trap (`_gotcha`, `anti_bot_token`) and submission velocity analysis (<600ms bot rejection).
3. **HMAC-SHA256 Webhook Verification:** Petpooja POS webhook payloads are cryptographically verified using constant-time `hmac.compare_digest`.
4. **JWT Role-Based Access Control (RBAC):** Granular permissions for `Admin`, `Kitchen`, `Cashier`, and `Waiter`.
5. **Rate Limiting:** Sliding-window per-IP limiter prevents brute-force on `/api/auth/login` and order flooding on `/api/orders/guest`.
6. **Security Headers (Helmet equivalent):** Strict `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, and CSP.
7. **Input Sanitization:** HTML tag stripping to neutralize XSS injection payloads.
8. **Appwrite Cloud Sync:** Non-blocking asynchronous cloud database sync via `httpx`.

---

## ⚡ Quick Start & Running the Server

### 1. Activate Virtual Environment
```powershell
# Windows PowerShell
.\backend\.venv\Scripts\Activate.ps1
```

### 2. Start the Server
```powershell
# Option A: Using the runner script
python backend/run.py

# Option B: Direct uvicorn command
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload --app-dir backend
```

The server will be live at:
- **API Base:** `http://localhost:5000/api`
- **Interactive Swagger UI:** `http://localhost:5000/docs`
- **ReDoc Documentation:** `http://localhost:5000/redoc`

---

## 🧪 Running Automated Tests

Run the full automated test suite covering all routers, security middlewares, and business calculations:

```powershell
.\backend\.venv\Scripts\pytest.exe backend/tests -v
```

---

## 📋 Default Staff Credentials

| Role | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Full Access (Audit logs, Reports, Table management) |
| **Kitchen Head** | `chef` | `admin123` | KDS Station routing, Menu availability, Inventory restock |
| **Cashier** | `cashier` | `admin123` | POS Billing, Bill Settlement, Z-Reports |
| **Waiter** | `waiter` | `admin123` | Table Service Calls, Floor Map |
