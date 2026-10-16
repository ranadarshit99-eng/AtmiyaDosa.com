from typing import List
from fastapi import APIRouter
from app.schemas.coupon import CouponValidateRequest, CouponResponse
from app.database import CANONICAL_COUPONS

router = APIRouter(prefix="/coupons", tags=["Promotions & Coupon Discounts"])

@router.get("", summary="List All Active Restaurant Coupon Offers")
async def list_coupons():
    """Retrieve all active promo codes with minimum order limits and descriptions."""
    coupons = [c for c in CANONICAL_COUPONS.values() if c["active"]]
    return {"success": True, "count": len(coupons), "coupons": coupons}

@router.post("/validate", response_model=CouponResponse, summary="Validate Coupon Code against Order Subtotal")
async def validate_coupon(body: CouponValidateRequest):
    """
    Validate a promo code server-side:
    Checks expiration, minimum bill requirements, and computes exact discount amount.
    """
    code = body.code.strip().upper()
    promo = CANONICAL_COUPONS.get(code)

    if not promo or not promo["active"]:
        return CouponResponse(
            valid=False,
            code=code,
            discount_amount=0.0,
            message=f"Coupon '{code}' is invalid or has expired."
        )

    if body.order_amount < promo["min_order"]:
        shortfall = promo["min_order"] - body.order_amount
        return CouponResponse(
            valid=False,
            code=code,
            discount_amount=0.0,
            message=f"Add items worth ₹{shortfall:.0f} more to apply code {code} (Min order: ₹{promo['min_order']:.0f})."
        )

    discount_amt = 0.0
    if promo["discount_type"] == "flat":
        discount_amt = float(promo["discount"])
    elif promo["discount_type"] == "percentage":
        discount_amt = round((body.order_amount * promo["discount"]) / 100.0, 2)

    return CouponResponse(
        valid=True,
        code=code,
        discount_amount=discount_amt,
        discount_type=promo["discount_type"],
        discount_value=promo["discount"],
        message=f"Coupon {code} applied! You saved ₹{discount_amt:.0f}."
    )
