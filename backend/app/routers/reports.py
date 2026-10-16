from datetime import datetime, timezone
from collections import defaultdict
from fastapi import APIRouter, Depends

from app.schemas.report import DailySalesSummary, ZReportResponse, TopSellingItem
from app.database import CANONICAL_ORDERS
from app.security import get_current_user, require_roles

router = APIRouter(prefix="/reports", tags=["Sales Telemetry & Z-Audit Reports"])

@router.get("/telemetry", summary="Real-Time POS Floor Telemetry")
async def get_sales_telemetry(current_user: dict = Depends(get_current_user)):
    """
    Compute real-time financial telemetry across completed and active orders.
    Calculates Cash vs UPI splits, unsettled floor revenue, and top-moving dishes.
    """
    total_sales = 0.0
    total_gst = 0.0
    cash_sales = 0.0
    upi_sales = 0.0
    active_revenue = 0.0
    item_stats = defaultdict(lambda: {"qty": 0, "revenue": 0.0})

    for o in CANONICAL_ORDERS:
        is_completed = o["status"] == "Completed"
        is_cancelled = o["status"] == "Cancelled"

        if is_cancelled:
            continue

        if is_completed:
            total_sales += o["total_amount"]
            total_gst += o.get("tax", 0.0)
            if o.get("payment_mode") == "UPI":
                upi_sales += o["total_amount"]
            else:
                cash_sales += o["total_amount"]
        else:
            active_revenue += o["total_amount"]

        for it in o.get("items", []):
            name = it["name"]
            item_stats[name]["qty"] += it.get("qty", 1)
            item_stats[name]["revenue"] += it.get("line_total", 0.0)

    top_items = sorted(
        [TopSellingItem(name=k, qty=v["qty"], revenue=v["revenue"]) for k, v in item_stats.items()],
        key=lambda x: x.qty,
        reverse=True
    )[:5]

    return {
        "success": True,
        "telemetry": DailySalesSummary(
            total_sales=round(total_sales, 2),
            total_orders=len([o for o in CANONICAL_ORDERS if o["status"] == "Completed"]),
            total_gst=round(total_gst, 2),
            cash_sales=round(cash_sales, 2),
            upi_sales=round(upi_sales, 2),
            active_dining_revenue=round(active_revenue, 2),
            top_items=top_items
        )
    }

@router.get("/z-report", response_model=ZReportResponse, summary="Generate Official End-of-Day Z-Report")
async def generate_z_report(current_user: dict = Depends(require_roles(["Admin", "Cashier"]))):
    """
    Official daily End-of-Day (EOD) financial closing report.
    Itemizes gross turnover, promotional write-offs, GSTIN split (CGST + SGST),
    cash drawer balance, and digital UPI reconciliation.
    """
    today_str = datetime.now().strftime("%d-%b-%Y")
    gross_sales = 0.0
    discounts_given = 0.0
    taxable_sales = 0.0
    total_tax = 0.0
    net_sales = 0.0
    cash_collected = 0.0
    upi_collected = 0.0
    completed_orders = 0
    cancelled_orders = 0

    for o in CANONICAL_ORDERS:
        if o["status"] == "Cancelled":
            cancelled_orders += 1
            continue

        subtotal = o.get("subtotal", 0.0)
        discount = o.get("discount", 0.0)
        tax = o.get("tax", 0.0)
        total = o.get("total_amount", 0.0)

        gross_sales += subtotal
        discounts_given += discount
        taxable_sales += (subtotal - discount)
        total_tax += tax
        net_sales += total
        completed_orders += 1

        if o.get("payment_mode") == "UPI":
            upi_collected += total
        else:
            cash_collected += total

    cgst = round(total_tax / 2.0, 2)
    sgst = round(total_tax / 2.0, 2)

    return ZReportResponse(
        report_id=f"ZR_{datetime.now().strftime('%Y%m%d')}_01",
        generated_at=datetime.now(timezone.utc).isoformat(),
        restaurant_name="Atmiya Dosa Hub",
        gstin="24AAACA1234A1Z5",
        date=today_str,
        gross_sales=round(gross_sales, 2),
        discounts_given=round(discounts_given, 2),
        net_taxable_sales=round(taxable_sales, 2),
        cgst_2_5=cgst,
        sgst_2_5=sgst,
        total_tax=round(total_tax, 2),
        net_sales=round(net_sales, 2),
        cash_collected=round(cash_collected, 2),
        upi_collected=round(upi_collected, 2),
        total_orders_count=completed_orders,
        void_cancelled_count=cancelled_orders
    )
