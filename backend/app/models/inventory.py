from typing import Optional
from pydantic import BaseModel

class InventoryItem(BaseModel):
    id: str
    name: str
    category: str
    stock: float
    unit: str
    threshold: float
    cost_per_unit: float
    supplier: Optional[str] = "Petlad Wholesale"
    last_restocked: Optional[str] = None

    @property
    def is_low_stock(self) -> bool:
        return self.stock <= self.threshold
