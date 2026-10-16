from pydantic import BaseModel

class Coupon(BaseModel):
    code: str
    discount: float
    discount_type: str  # flat, percentage
    min_order: float = 0.0
    active: bool = True
    description: str = ""
