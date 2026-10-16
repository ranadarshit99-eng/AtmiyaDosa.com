from typing import Optional
from pydantic import BaseModel, Field

class CouponValidateRequest(BaseModel):
    code: str = Field(..., min_length=2, max_length=30)
    order_amount: float = Field(..., ge=0)

class CouponResponse(BaseModel):
    valid: bool
    code: str
    discount_amount: float = 0.0
    discount_type: str = "flat"  # flat | percentage
    discount_value: float = 0.0
    message: str
