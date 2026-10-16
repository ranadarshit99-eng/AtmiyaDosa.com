from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException, status, Depends

from app.schemas.inventory import (
    RestockRequest,
    InventoryItemResponse,
    InventoryListResponse
)
from app.database import (
    CANONICAL_INVENTORY,
    log_admin_action
)
from app.security import get_current_user, require_roles

router = APIRouter(prefix="/inventory", tags=["Raw Material & Stock Inventory"])

def _to_response(item: dict) -> InventoryItemResponse:
    return InventoryItemResponse(
        id=item["id"],
        name=item["name"],
        category=item["category"],
        stock=item["stock"],
        unit=item["unit"],
        threshold=item["threshold"],
        cost_per_unit=item["cost_per_unit"],
        supplier=item.get("supplier"),
        is_low_stock=item["stock"] <= item["threshold"],
        last_restocked=item.get("last_restocked")
    )

@router.get("", response_model=InventoryListResponse, summary="List All Inventory Ingredients")
async def list_inventory():
    """Retrieve raw materials, current quantities, threshold levels, and low-stock warnings."""
    items = list(CANONICAL_INVENTORY.values())
    low_count = sum(1 for it in items if it["stock"] <= it["threshold"])
    return InventoryListResponse(
        success=True,
        total_items=len(items),
        low_stock_count=low_count,
        items=[_to_response(it) for it in items]
    )

@router.get("/alerts", summary="Get Critical Low-Stock Threshold Alerts")
async def get_low_stock_alerts():
    """Returns only raw materials that breached their minimum operating threshold."""
    low_items = [it for it in CANONICAL_INVENTORY.values() if it["stock"] <= it["threshold"]]
    return {
        "success": True,
        "critical_count": len(low_items),
        "alerts": [_to_response(it) for it in low_items]
    }

@router.post("/{item_id}/restock", response_model=InventoryItemResponse, summary="One-Click Restock Ingredient")
async def restock_item(
    item_id: str,
    body: RestockRequest,
    current_user: dict = Depends(require_roles(["Admin", "Kitchen"]))
):
    """Restock a raw material item by adding the specified quantity."""
    item = CANONICAL_INVENTORY.get(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inventory item '{item_id}' not found."
        )

    prev_stock = item["stock"]
    item["stock"] = round(item["stock"] + body.amount, 2)
    item["last_restocked"] = datetime.now().strftime("Today %I:%M %p")
    if body.supplier:
        item["supplier"] = body.supplier

    await log_admin_action(
        employee_name=current_user.get("name", "Staff"),
        employee_role=current_user.get("role", "Staff"),
        action_type="STOCK_RESTOCKED",
        details=f"Restocked {item['name']} by +{body.amount} {item['unit']} (Was: {prev_stock}, Now: {item['stock']})"
    )

    return _to_response(item)
