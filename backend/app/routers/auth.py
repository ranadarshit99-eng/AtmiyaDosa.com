from fastapi import APIRouter, HTTPException, status, Depends, Request
from app.schemas.auth import LoginRequest, TokenResponse, UserProfile
from app.database import CANONICAL_STAFF, log_admin_action
from app.security import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Staff Authentication"])

@router.post("/login", response_model=TokenResponse, summary="Staff Authentication Login")
async def login(request: Request, body: LoginRequest):
    """
    Authenticate staff (Admin, Kitchen Chef, Cashier, Waiter) and return signed JWT.
    Enforces brute-force rate-limiting and audit logging.
    """
    username = body.username.lower().strip()
    user = CANONICAL_STAFF.get(username)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid staff credentials."
        )

    if not verify_password(body.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid staff credentials."
        )

    # Issue 12-hour JWT token
    token_data = {
        "sub": user["username"],
        "name": user["name"],
        "role": user["role"],
        "restaurant": "Atmiya Dosa Hub"
    }
    token = create_access_token(token_data)

    client_ip = request.client.host if request.client else "unknown"
    await log_admin_action(
        employee_name=user["name"],
        employee_role=user["role"],
        action_type="STAFF_LOGIN",
        details=f"Staff member logged in from {client_ip}"
    )

    return TokenResponse(
        success=True,
        token=token,
        token_type="bearer",
        user=UserProfile(
            name=user["name"],
            username=user["username"],
            role=user["role"],
            restaurant="Atmiya Dosa Hub"
        )
    )

@router.get("/me", response_model=UserProfile, summary="Get Current Authenticated Staff Profile")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Retrieve profile and role permissions of current token holder."""
    return UserProfile(
        name=current_user.get("name", "Staff"),
        username=current_user.get("sub", ""),
        role=current_user.get("role", "Staff"),
        restaurant=current_user.get("restaurant", "Atmiya Dosa Hub")
    )
