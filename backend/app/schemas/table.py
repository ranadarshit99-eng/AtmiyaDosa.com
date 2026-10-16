from typing import Optional, List
from pydantic import BaseModel, Field

class TableCreate(BaseModel):
    number: str = Field(..., min_length=1, max_length=20, description="Table identifier code, e.g. T17, VIP-1")
    capacity: int = Field(default=4, ge=1, le=50, description="Seating capacity count")
    zone: str = Field(default="Main Hall", description="Zone: Main Hall, AC Section, Patio Garden, Family Section, Rooftop Lounge")

class TableUpdate(BaseModel):
    capacity: Optional[int] = Field(default=None, ge=1, le=50)
    zone: Optional[str] = None
    status: Optional[str] = None  # available, occupied, billing, reserved
    current_order_id: Optional[str] = None
    timing: Optional[str] = None

class ShiftTableRequest(BaseModel):
    target_table_number: str = Field(..., min_length=1, max_length=20, description="Destination vacant table code")

class SettleBillRequest(BaseModel):
    payment_method: str = Field(default="Cash", description="Cash | UPI | Card")

class TableResponse(BaseModel):
    id: str
    number: str
    capacity: int
    zone: str
    status: str
    current_order_id: Optional[str] = None
    timing: Optional[str] = None
    qr_url: Optional[str] = None

class TableListResponse(BaseModel):
    success: bool = True
    total: int
    occupied: int
    vacant: int
    tables: List[TableResponse]
