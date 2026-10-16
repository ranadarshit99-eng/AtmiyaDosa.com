from typing import Optional, List
from pydantic import BaseModel, Field

class MenuItemCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    gujarati_name: Optional[str] = None
    price: float = Field(..., ge=0)
    category: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = None
    is_available: bool = True
    is_jain_available: bool = True
    prep_time_mins: int = 10
    image_url: Optional[str] = None

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    gujarati_name: Optional[str] = None
    price: Optional[float] = Field(default=None, ge=0)
    category: Optional[str] = None
    is_available: Optional[bool] = None
    is_jain_available: Optional[bool] = None
    prep_time_mins: Optional[int] = None

class MenuItemResponse(BaseModel):
    id: str
    name: str
    gujarati_name: Optional[str] = None
    price: float
    category: str
    description: Optional[str] = None
    is_available: bool
    is_jain_available: bool
    prep_time_mins: int
    image_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)

class CategoryResponse(BaseModel):
    id: str
    name: str
    icon: Optional[str] = "Utensils"
    count: int = 0
