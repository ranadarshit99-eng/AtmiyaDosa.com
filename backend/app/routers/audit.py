from typing import List, Optional
from fastapi import APIRouter, Depends
from app.database import CANONICAL_AUDIT_LOGS
from app.security import require_roles

router = APIRouter(prefix="/audit-logs", tags=["Staff Activity Audit Trail"])

@router.get("", summary="Get System Audit Logs (Admin Only)")
async def get_audit_logs(
    limit: int = 100,
    current_user: dict = Depends(require_roles(["Admin"]))
):
    """
    Retrieve chronological audit entries tracking logins, order status transitions,
    table additions, inventory restocks, and bill settlements.
    """
    logs = CANONICAL_AUDIT_LOGS[:limit]
    return {
        "success": True,
        "count": len(logs),
        "total": len(CANONICAL_AUDIT_LOGS),
        "logs": logs
    }
