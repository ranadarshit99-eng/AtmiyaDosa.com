import html
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends

from app.schemas.service_call import (
    ServiceCallCreate,
    ServiceCallResponse,
    ServiceCallListResponse
)
from app.database import (
    CANONICAL_SERVICE_CALLS,
    CANONICAL_TABLES,
    log_admin_action
)
from app.security import get_current_user

router = APIRouter(prefix="/service-calls", tags=["Table Assistance & Waiter Service Calls"])

@router.post("", response_model=ServiceCallResponse, status_code=status.HTTP_201_CREATED, summary="Guest Table Assistance Request")
async def create_service_call(body: ServiceCallCreate):
    """
    Called when a customer taps 'Call Waiter', 'Request Water', or 'Request Bill'
    on the touchless menu standee page.
    """
    clean_table = html.escape(body.table_number.strip().upper())
    clean_type = body.request_type.strip().lower()

    valid_types = ["waiter", "water", "bill", "clean"]
    if clean_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid request type '{clean_type}'. Must be one of: {', '.join(valid_types)}"
        )

    call_id = f"call_{uuid.uuid4().hex[:6]}"
    new_call = {
        "id": call_id,
        "table_number": clean_table,
        "request_type": clean_type,
        "status": "pending",
        "notes": html.escape(body.notes.strip()) if body.notes else None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "resolved_at": None
    }
    CANONICAL_SERVICE_CALLS.insert(0, new_call)

    return ServiceCallResponse(**new_call)

@router.get("", response_model=ServiceCallListResponse, summary="List All Active Service Calls (Staff Only)")
async def list_service_calls(current_user: dict = Depends(get_current_user)):
    """Retrieve active and recent table service calls for waiter dispatch."""
    active_count = sum(1 for c in CANONICAL_SERVICE_CALLS if c["status"] == "pending")
    return ServiceCallListResponse(
        success=True,
        active_count=active_count,
        calls=[ServiceCallResponse(**c) for c in CANONICAL_SERVICE_CALLS]
    )

@router.put("/{call_id}/resolve", response_model=ServiceCallResponse, summary="Mark Table Service Call Attended / Resolved")
async def resolve_service_call(
    call_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark a table assistance request as resolved by the attendant."""
    call = next((c for c in CANONICAL_SERVICE_CALLS if c["id"] == call_id), None)
    if not call:
        raise HTTPException(status_code=404, detail="Service call not found.")

    call["status"] = "resolved"
    call["resolved_at"] = datetime.now(timezone.utc).isoformat()

    await log_admin_action(
        employee_name=current_user.get("name", "Staff"),
        employee_role=current_user.get("role", "Staff"),
        action_type="SERVICE_CALL_RESOLVED",
        details=f"Attended {call['request_type']} request for Table {call['table_number']}",
        table_number=call["table_number"]
    )

    return ServiceCallResponse(**call)
