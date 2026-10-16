from typing import Optional
from pydantic import BaseModel

class StaffMember(BaseModel):
    username: str
    name: str
    role: str  # Admin, Kitchen, Cashier, Waiter
    password_hash: str
    phone: Optional[str] = None
    shift: Optional[str] = "Morning"
    is_active: bool = True

class ActivityLog(BaseModel):
    id: str
    employee_name: str
    employee_role: str
    action_type: str
    details: str
    table_number: Optional[str] = None
    order_id: Optional[str] = None
    timestamp: str
