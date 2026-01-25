from fastapi import APIRouter, Query, HTTPException, Depends
from typing import List
from pydantic import BaseModel
from astro_app.backend.geo.service import search_location
from astro_app.backend.auth.router import get_current_user
from astro_app.backend.models import User

router = APIRouter()

class LocationResult(BaseModel):
    name: str
    latitude: float
    longitude: float
    timezone_id: str
    timezone_offset: str

@router.get("/search", response_model=List[LocationResult])
def search_places(q: str = Query(..., min_length=2), current_user: User = Depends(get_current_user)):
    """
    Search for a city/place and get coordinates + timezone.
    """
    results = search_location(q)
    return results
