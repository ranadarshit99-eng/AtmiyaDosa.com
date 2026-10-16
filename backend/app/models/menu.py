from typing import Optional, List
from pydantic import BaseModel, Field

class MenuItem(BaseModel):
    id: str
    name: str
    gujarati_name: Optional[str] = None
    price: float
    category: str
    description: Optional[str] = None
    is_available: bool = True
    is_jain_available: bool = True
    prep_time_mins: int = 10
    image_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)

class Category(BaseModel):
    id: str
    name: str
    icon: Optional[str] = "Utensils"
    display_order: int = 1
