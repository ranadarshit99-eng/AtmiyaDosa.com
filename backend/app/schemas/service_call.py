from typing import Optional, List
from pydantic import BaseModel, Field

class ServiceCallCreate(BaseModel):
    table_number: str = Field(..., min_length=1, max_length=20, description="Dining table number")
    request_type: str = Field(..., description="waiter | water | bill | clean")
    notes: Optional[str] = Field(default=None, max_length=200)

class ServiceCallResponse(BaseModel):
    id: str
    table_number: str
    request_type: str
    status: str  # pending, attended, resolved
    notes: Optional[str] = None
    created_at: str
    resolved_at: Optional[str] = None

class ServiceCallListResponse(BaseModel):
    success: bool = True
    active_count: int
    calls: List[ServiceCallResponse]
