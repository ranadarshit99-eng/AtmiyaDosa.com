from typing import Optional
from pydantic import BaseModel, Field

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50, description="Staff username (e.g. admin, chef, cashier, waiter)")
    password: str = Field(..., min_length=1, max_length=100, description="Staff password")

class UserProfile(BaseModel):
    name: str
    username: str
    role: str
    restaurant: str = "Atmiya Dosa Hub"

class TokenResponse(BaseModel):
    success: bool = True
    token: str
    token_type: str = "bearer"
    user: UserProfile
