from fastapi import APIRouter, Request, HTTPException, status, Header
from typing import Optional
from app.security import verify_petpooja_hmac
from app.database import log_admin_action

router = APIRouter(prefix="/webhooks", tags=["Third-Party Integrations & Webhooks"])

@router.post("/petpooja", summary="Petpooja POS Online Order Webhook (HMAC-SHA256)")
async def petpooja_webhook(
    request: Request,
    x_petpooja_signature: Optional[str] = Header(default=None, alias="x-petpooja-signature"),
    x_hub_signature_256: Optional[str] = Header(default=None, alias="x-hub-signature-256")
):
    """
    Cryptographically verifies Petpooja POS webhook payload via HMAC-SHA256 signature.
    Prevents forged orders and timing side-channel exploits.
    """
    raw_body = await request.body()
    sig = x_petpooja_signature or x_hub_signature_256

    if not sig:
        print("⚠️ Webhook rejected: Missing HMAC signature header")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Missing HMAC signature header."
        )

    if not verify_petpooja_hmac(raw_body, sig):
        print("⛔ Webhook signature mismatch: Rejected forged payload")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Invalid webhook signature."
        )

    try:
        payload = await request.json()
    except Exception:
        payload = {}

    print(f"✅ Petpooja Webhook Signature Verified. Ingestion payload: {payload}")

    await log_admin_action(
        employee_name="Petpooja POS Integration",
        employee_role="System",
        action_type="WEBHOOK_ORDER_INGESTED",
        details="Verified and processed online order from Petpooja POS cloud"
    )

    return {"success": True, "message": "Signature verified and queued for Kitchen KDS dispatch."}
