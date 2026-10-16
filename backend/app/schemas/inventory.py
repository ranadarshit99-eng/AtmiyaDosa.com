from typing import Optional, List
from pydantic import BaseModel, Field

class RestockRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount of stock to add in base units")
    supplier: Optional[str] = "Petlad Wholesale"
    notes: Optional[str] = None

class InventoryItemResponse(BaseModel):
    id: str
    name: str
    category: str
    stock: float
    unit: str
    threshold: float
    cost_per_unit: float
    supplier: Optional[str]
    is_low_stock: bool
    last_restocked: Optional[str] = None

class InventoryListResponse(BaseModel):
    success: bool = True
    total_items: int
    low_stock_count: int
    items: List[InventoryItemResponse]
