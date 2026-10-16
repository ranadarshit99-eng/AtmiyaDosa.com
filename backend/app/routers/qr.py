import io
from fastapi import APIRouter, Response, Request, HTTPException
import qrcode
from qrcode.image.pil import PilImage

from app.database import CANONICAL_TABLES

router = APIRouter(prefix="/qr", tags=["Table QR Codes & Touchless Standees"])

@router.get("/{table_number}", summary="Get Table QR Metadata & Direct Menu Link")
async def get_table_qr_meta(table_number: str, request: Request):
    """
    Retrieve QR standee metadata, direct guest ordering URL,
    and restaurant table Wi-Fi details.
    """
    clean_num = table_number.strip().upper()
    frontend_base = "http://localhost:5173"
    target_url = f"{frontend_base}/?table={clean_num}"

    table = CANONICAL_TABLES.get(clean_num)
    capacity = table.get("capacity", 4) if table else 4
    zone = table.get("zone", "Main Hall") if table else "Main Hall"

    return {
        "success": True,
        "table_number": clean_num,
        "capacity": capacity,
        "zone": zone,
        "touchless_url": target_url,
        "wifi": {
            "ssid": "Atmiya_Guest",
            "password": "delicious123"
        },
        "purpose": "Touchless table ordering without login barrier. Direct KDS dispatch.",
        "brand": {
            "name": "Atmiya Dosa Hub",
            "tagline": "Pure Veg • Authentic Taste",
            "location": "Petlad, Gujarat"
        }
    }

@router.get("/{table_number}/image", summary="Generate Dynamic QR Code Standee PNG")
async def generate_table_qr_image(table_number: str, request: Request):
    """
    Dynamically renders high-resolution PNG QR code pointing directly
    to the touchless guest ordering flow for the specified table.
    """
    clean_num = table_number.strip().upper()
    frontend_base = "http://localhost:5173"
    target_url = f"{frontend_base}/?table={clean_num}"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(target_url)
    qr.make(fit=True)

    img: PilImage = qr.make_image(fill_color="#0f172a", back_color="#ffffff")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    png_bytes = buffer.getvalue()

    return Response(
        content=png_bytes,
        media_type="image/png",
        headers={"Content-Disposition": f'inline; filename="AtmiyaDosa-QR-{clean_num}.png"'}
    )
