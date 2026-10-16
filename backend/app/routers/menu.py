import html
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends

from app.schemas.menu import (
    MenuItemCreate,
    MenuItemUpdate,
    MenuItemResponse,
    CategoryResponse
)
from app.database import (
    CANONICAL_MENU,
    CANONICAL_CATEGORIES,
    log_admin_action
)
from app.security import get_current_user, require_roles

router = APIRouter(prefix="/menu", tags=["Menu & Category Catalog"])

@router.get("", summary="Get Canonical Menu Catalog (Public / Guest / POS)")
async def get_menu(category: Optional[str] = None):
    """
    Retrieve live menu items. Supports optional filtering by category.
    Returns authoritative server prices and dietary flags.
    """
    items = list(CANONICAL_MENU.values())
    if category and category.lower() != "all":
        items = [i for i in items if i["category"].lower() == category.lower()]
    
    return {
        "success": True,
        "count": len(items),
        "items": [MenuItemResponse(**i) for i in items]
    }

@router.get("/categories", summary="List All Menu Categories with Counts")
async def get_categories():
    """Retrieve all categories with live counts of available dishes."""
    result = []
    for cat in CANONICAL_CATEGORIES:
        count = sum(1 for it in CANONICAL_MENU.values() if it["category"] == cat["name"])
        result.append(CategoryResponse(
            id=cat["id"],
            name=cat["name"],
            icon=cat.get("icon", "Utensils"),
            count=count
        ))
    return {"success": True, "categories": result}

@router.post("", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED, summary="Add New Menu Item (Admin/Kitchen)")
async def create_menu_item(
    body: MenuItemCreate,
    current_user: dict = Depends(require_roles(["Admin", "Kitchen"]))
):
    item_id = f"item_atmiya_{len(CANONICAL_MENU) + 1:02d}"
    new_item = {
        "id": item_id,
        "name": html.escape(body.name.strip()),
        "gujarati_name": html.escape(body.gujarati_name.strip()) if body.gujarati_name else None,
        "price": float(body.price),
        "category": body.category,
        "description": html.escape(body.description.strip()) if body.description else "",
        "is_available": body.is_available,
        "is_jain_available": body.is_jain_available,
        "prep_time_mins": body.prep_time_mins,
        "image_url": body.image_url,
        "tags": ["New Item"]
    }

    CANONICAL_MENU[item_id] = new_item

    await log_admin_action(
        employee_name=current_user.get("name", "Staff"),
        employee_role=current_user.get("role", "Staff"),
        action_type="MENU_ITEM_CREATED",
        details=f"Created menu item '{new_item['name']}' in category '{new_item['category']}' for ₹{new_item['price']}"
    )

    return MenuItemResponse(**new_item)

@router.put("/{item_id}", response_model=MenuItemResponse, summary="Update Menu Item or Availability")
async def update_menu_item(
    item_id: str,
    body: MenuItemUpdate,
    current_user: dict = Depends(require_roles(["Admin", "Kitchen"]))
):
    item = CANONICAL_MENU.get(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item '{item_id}' not found."
        )

    if body.name is not None:
        item["name"] = html.escape(body.name.strip())
    if body.gujarati_name is not None:
        item["gujarati_name"] = html.escape(body.gujarati_name.strip())
    if body.price is not None:
        item["price"] = float(body.price)
    if body.category is not None:
        item["category"] = body.category
    if body.is_available is not None:
        item["is_available"] = body.is_available
    if body.is_jain_available is not None:
        item["is_jain_available"] = body.is_jain_available
    if body.prep_time_mins is not None:
        item["prep_time_mins"] = body.prep_time_mins

    await log_admin_action(
        employee_name=current_user.get("name", "Staff"),
        employee_role=current_user.get("role", "Staff"),
        action_type="MENU_ITEM_UPDATED",
        details=f"Updated menu item {item_id} ({item['name']})"
    )

    return MenuItemResponse(**item)
