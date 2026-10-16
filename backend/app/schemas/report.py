from typing import List, Dict, Any
from pydantic import BaseModel

class TopSellingItem(BaseModel):
    name: str
    qty: int
    revenue: float

class DailySalesSummary(BaseModel):
    total_sales: float
    total_orders: int
    total_gst: float
    cash_sales: float
    upi_sales: float
    active_dining_revenue: float
    top_items: List[TopSellingItem]

class ZReportResponse(BaseModel):
    report_id: str
    generated_at: str
    restaurant_name: str = "Atmiya Dosa Hub"
    gstin: str = "24AAACA1234A1Z5"
    date: str
    gross_sales: float
    discounts_given: float
    net_taxable_sales: float
    cgst_2_5: float
    sgst_2_5: float
    total_tax: float
    net_sales: float
    cash_collected: float
    upi_collected: float
    total_orders_count: int
    void_cancelled_count: int
