import hmac
import hashlib
import json
import pytest
from starlette.testclient import TestClient

from app.main import app
from app.config import settings

client = TestClient(app)

def test_health_check():
    """Verify health and 19/19 security checklist posture."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["architecture"] == "Python FastAPI Modular Architecture"
    assert data["security_posture"]["never_trust_frontend_prices"] is True
    assert data["security_posture"]["cors_locked"] is True

def test_menu_catalog():
    """Verify canonical menu items are returned with prices."""
    response = client.get("/api/menu")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["count"] >= 23
    assert any(item["name"] == "Mysore Masala Dosa" for item in data["items"])

def test_staff_login_and_auth_flow():
    """Verify admin login generates valid JWT and grants access to protected routes."""
    # 1. Invalid login
    res_bad = client.post("/api/auth/login", json={"username": "admin", "password": "wrongpassword"})
    assert res_bad.status_code == 401

    # 2. Valid login
    res_ok = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert res_ok.status_code == 200
    data = res_ok.json()
    assert "token" in data
    assert data["user"]["role"] == "Admin"
    token = data["token"]

    # 3. Access protected route with Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    res_me = client.get("/api/auth/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["username"] == "admin"

    # 4. Access audit logs (Admin only)
    res_audit = client.get("/api/audit-logs", headers=headers)
    assert res_audit.status_code == 200
    assert "logs" in res_audit.json()

def test_table_creation_with_qr():
    """Verify adding table with dynamic QR code generation."""
    # Login as admin
    login_res = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Add Table T99
    new_table_payload = {"number": "T99", "capacity": 6, "zone": "Patio Garden"}
    res = client.post("/api/tables", json=new_table_payload, headers=headers)
    assert res.status_code == 201
    tbl = res.json()
    assert tbl["number"] == "T99"
    assert tbl["capacity"] == 6
    assert "qr_url" in tbl
    assert "?table=T99" in tbl["qr_url"]

    # Test QR metadata route
    qr_res = client.get("/api/qr/T99")
    assert qr_res.status_code == 200
    assert qr_res.json()["table_number"] == "T99"

    # Test QR PNG generation route
    qr_img = client.get("/api/qr/T99/image")
    assert qr_img.status_code == 200
    assert qr_img.headers["content-type"] == "image/png"
    assert len(qr_img.content) > 100

def test_guest_order_authoritative_pricing():
    """
    Test Never Trust Frontend rule:
    Submits order without price fields. Server must authoritatively
    calculate subtotal, 5% GST, and verify discount coupon.
    """
    payload = {
        "table_number": "T05",
        "customer_name": "Test Guest",
        "items": [
            {"id": "item_atmiya_01", "qty": 2},  # Mysore Masala: 130 * 2 = 260
            {"id": "item_atmiya_22", "qty": 1}   # Cold Drink: 40 * 1 = 40
        ],
        "coupon_code": "WELCOME50",  # Flat 50 off on orders >= 250
        "payment_mode": "UPI"
    }

    res = client.post("/api/orders/guest", json=payload)
    assert res.status_code == 201
    order = res.json()
    
    # Subtotal: 260 + 40 = 300
    assert order["subtotal"] == 300.0
    # Discount: 50
    assert order["discount"] == 50.0
    # Taxable: 250, GST 5%: 12.50
    assert order["tax"] == 12.5
    # Total: 250 + 12.50 = 262.50
    assert order["total_amount"] == 262.5
    assert order["table_number"] == "T05"

def test_inventory_and_restock():
    """Verify inventory listing and one-click restocking."""
    # Login as admin
    login_res = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get inventory
    res = client.get("/api/inventory")
    assert res.status_code == 200
    items = res.json()["items"]
    assert len(items) >= 9

    # Restock inv_01 by +10 kg
    res_restock = client.post(
        "/api/inventory/inv_01/restock",
        json={"amount": 10.0, "supplier": "Fresh Daily Mills"},
        headers=headers
    )
    assert res_restock.status_code == 200
    assert res_restock.json()["stock"] >= 52.0

def test_service_calls_flow():
    """Verify guest table assistance requests."""
    # Place service call for waiter
    res_call = client.post("/api/service-calls", json={"table_number": "T03", "request_type": "water"})
    assert res_call.status_code == 201
    call_id = res_call.json()["id"]

    # Login to view and resolve
    login_res = client.post("/api/auth/login", json={"username": "waiter", "password": "admin123"})
    headers = {"Authorization": f"Bearer {login_res.json()['token']}"}

    # Resolve call
    res_res = client.put(f"/api/service-calls/{call_id}/resolve", headers=headers)
    assert res_res.status_code == 200
    assert res_res.json()["status"] == "resolved"

def test_petpooja_webhook_hmac():
    """Verify Petpooja webhook rejects forged payload and accepts valid HMAC signature."""
    payload = json.dumps({"order_id": "PP_99182", "amount": 450}).encode("utf-8")

    # 1. Missing signature -> 401
    res_no_sig = client.post("/api/webhooks/petpooja", content=payload)
    assert res_no_sig.status_code == 401

    # 2. Forged signature -> 403
    res_bad_sig = client.post("/api/webhooks/petpooja", content=payload, headers={"x-petpooja-signature": "invalid_sig"})
    assert res_bad_sig.status_code == 403

    # 3. Valid HMAC signature -> 200
    valid_sig = hmac.new(settings.PETPOOJA_WEBHOOK_SECRET.encode("utf-8"), payload, hashlib.sha256).hexdigest()
    res_ok = client.post("/api/webhooks/petpooja", content=payload, headers={"x-petpooja-signature": valid_sig})
    assert res_ok.status_code == 200
    assert res_ok.json()["success"] is True
