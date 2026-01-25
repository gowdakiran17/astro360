from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from astro_app.backend.database import get_db
from astro_app.backend.models import User, Chart
from astro_app.backend.auth.router import get_current_user

router = APIRouter()

# Pydantic Models
class ChartBase(BaseModel):
    first_name: str
    last_name: str
    gender: Optional[str] = None
    relation: Optional[str] = "Myself"
    
    date_str: str # DD/MM/YYYY
    time_str: str # HH:MM
    timezone_str: str
    latitude: float
    longitude: float
    location_name: Optional[str] = ""

class ChartCreate(ChartBase):
    pass

class ChartUpdate(BaseModel):
    is_default: Optional[bool] = None

class ChartResponse(ChartBase):
    id: int
    created_at: datetime
    is_default: bool
    
    class Config:
        from_attributes = True

# Routes

@router.post("/", response_model=ChartResponse)
def create_chart(chart: ChartCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    print(f"DEBUG: Received create_chart request for user {current_user.id}")
    # Create new chart
    db_chart = Chart(
        user_id=current_user.id,
        first_name=chart.first_name,
        last_name=chart.last_name,
        gender=chart.gender,
        relation=chart.relation,
        date_str=chart.date_str,
        time_str=chart.time_str,
        timezone_str=chart.timezone_str,
        latitude=chart.latitude,
        longitude=chart.longitude,
        location_name=chart.location_name
    )
    db.add(db_chart)
    db.commit()
    db.refresh(db_chart)
    print(f"DEBUG: Chart saved successfully with ID {db_chart.id}")
    return db_chart

@router.get("/", response_model=List[ChartResponse])
def get_charts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    print(f"DEBUG: Fetching charts for user {current_user.id}")
    charts = db.query(Chart).filter(Chart.user_id == current_user.id).all()
    print(f"DEBUG: Found {len(charts)} charts")
    return charts

@router.put("/{chart_id}", response_model=ChartResponse)
def update_chart(chart_id: int, chart_update: ChartUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    chart = db.query(Chart).filter(Chart.id == chart_id, Chart.user_id == current_user.id).first()
    if not chart:
        raise HTTPException(status_code=404, detail="Chart not found")
    
    if chart_update.is_default is not None:
        # If setting as default, unset others
        if chart_update.is_default:
            db.query(Chart).filter(Chart.user_id == current_user.id).update({"is_default": False})
        chart.is_default = chart_update.is_default
        
    db.commit()
    db.refresh(chart)
    return chart

@router.delete("/{chart_id}")
def delete_chart(chart_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    chart = db.query(Chart).filter(Chart.id == chart_id, Chart.user_id == current_user.id).first()
    if not chart:
        raise HTTPException(status_code=404, detail="Chart not found")
    
    db.delete(chart)
    db.commit()
    return {"message": "Chart deleted"}
