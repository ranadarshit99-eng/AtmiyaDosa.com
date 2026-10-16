from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class OrderItem(BaseModel):
    id: str
    name: str
    price: float
    qty: int = 1
    line_total: float
    notes: Optional[str] = None
    modifiers: List[str] = Field(default_factory=list)

class Order(BaseModel):
    id: str
    table_number: str
    customer_name: str = "Walk-in Guest"
    items: List[OrderItem]
    items_summary: str
    subtotal: float
    discount: float = 0.0
    tax: float = 0.0
    total_amount: float
    status: str = "Placed"  # Placed, Cooking, Preparing, Ready, Served, Completed, Cancelled
    payment_mode: str = "Cash"  # Cash, UPI, Card
    payment_status: str = "Pending"  # Pending, Paid
    placed_at: str
    estimated_time_mins: int = 15
