from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict
from astro_app.backend.astrology.utils import validate_date, validate_time, validate_timezone

class BirthDetails(BaseModel):
    name: Optional[str] = Field(None, description="Name of the person")
    date: str = Field(..., description="Date in DD/MM/YYYY format", example="31/12/2010")
    time: str = Field(..., description="Time in HH:MM format (24h)", example="23:40")
    timezone: str = Field(..., description="Timezone offset (+HH:MM or -HH:MM)", example="+08:00")
    latitude: float = Field(..., description="Latitude (-90 to 90)", example=35.65)
    longitude: float = Field(..., description="Longitude (-180 to 180)", example=139.83)

    @validator('date')
    def check_date(cls, v):
        if not validate_date(v):
            raise ValueError('Invalid date format. Use DD/MM/YYYY')
        return v

    @validator('time')
    def check_time(cls, v):
        if not validate_time(v):
            raise ValueError('Invalid time format. Use HH:MM')
        return v
    
    @validator('timezone')
    def check_timezone(cls, v):
        if not validate_timezone(v):
            raise ValueError('Invalid timezone format. Use +HH:MM or -HH:MM')
        return v

    @validator('latitude')
    def check_lat(cls, v):
        if not (-90 <= v <= 90):
            raise ValueError('Latitude must be between -90 and 90')
        return v
        
    @validator('longitude')
    def check_lon(cls, v):
        if not (-180 <= v <= 180):
            raise ValueError('Longitude must be between -180 and 180')
        return v

# KP Astrology Schemas
class KPChartRequest(BaseModel):
    birth_details: BirthDetails
    horary_number: Optional[int] = Field(0, description="KP Horary number (1-249)", example=108)

class KPDashaRequest(BaseModel):
    birth_details: BirthDetails
    years_ahead: int = Field(5, description="Number of years to calculate ahead", example=5)

class KPCategoryRequest(BaseModel):
    birth_details: BirthDetails
    category: str = Field(..., description="Category: career, love, finance, property, health, fame", example="career")

class KPAIRequest(BaseModel):
    dasha_hierarchy: Dict
    event_name: Optional[str] = None
    significators: Optional[Dict] = None

class DashaRequest(BaseModel):
    birth_details: BirthDetails
    moon_longitude: Optional[float] = Field(None, description="Moon longitude in degrees (0-360)", example=120.5)
    ayanamsa: Optional[str] = Field("LAHIRI", description="Ayanamsa system (LAHIRI, RAMAN, KP, TROPICAL)", example="LAHIRI")

class PlanetInput(BaseModel):
    name: str
    longitude: float

class DivisionalRequest(BaseModel):
    planets: List[PlanetInput]
    birth_details: Optional[BirthDetails] = None

class MatchingRequest(BaseModel):
    boy: BirthDetails
    girl: BirthDetails

class PeriodRequest(BaseModel):
    birth_details: BirthDetails
    moon_longitude: Optional[float] = Field(None, description="Moon longitude in degrees (0-360)", example=120.5)
    month: int = Field(..., description="Month (1-12)", ge=1, le=12, example=1)
    year: int = Field(..., description="Year (e.g. 2026)", ge=1900, le=2100, example=2026)

class ShodashvargaRequest(BaseModel):
    birth_details: BirthDetails

class AshtakvargaRequest(BaseModel):
    birth_details: BirthDetails

class ShadbalaRequest(BaseModel):
    birth_details: BirthDetails

class ShadowPlanetsRequest(BaseModel):
    birth_details: BirthDetails

class TransitRequest(BaseModel):
    date: str = Field(..., description="Date in DD/MM/YYYY format")
    time: str = Field(..., description="Time in HH:MM format (24h)")
    timezone: str = Field(..., description="Timezone offset (+HH:MM or -HH:MM)")
    latitude: float
    longitude: float
    location_name: Optional[str] = "Bengaluru, Karnataka, IN"

class PanchangRequest(BaseModel):
    date: str
    time: str
    timezone: str
    latitude: float
    longitude: float

    @validator('timezone')
    def check_timezone(cls, v):
        if not validate_timezone(v):
            raise ValueError('Invalid timezone format. Use +HH:MM, -HH:MM, or named zone like Asia/Kolkata')
        return v

class CompatibilityRequest(BaseModel):
    boy: BirthDetails
    girl: BirthDetails

class MuhurataRequest(BaseModel):
    date: str
    time: str
    timezone: str
    latitude: float
    longitude: float

    @validator('timezone')
    def check_timezone(cls, v):
        if not validate_timezone(v):
            raise ValueError('Invalid timezone format. Use +HH:MM, -HH:MM, or named zone like Asia/Kolkata')
        return v

class MuhurtaSearchRequest(MuhurataRequest):
    end_date: str = Field(..., description="End date in DD/MM/YYYY format")
    target_quality: Optional[List[str]] = Field(["Excellent", "Good"], description="Quality levels to search")

class IngressRequest(BaseModel):
    planet: str = Field(..., description="Planet name (e.g. Jupiter)")
    current_date: str = Field(..., description="Date around which to check")
    timezone: str = Field(..., description="Timezone offset")
    window_days: int = Field(7, description="Days to check before/after")

class AnalysisRequest(BaseModel):
    birth_details: BirthDetails
    analysis_date: Optional[str] = Field(None, description="Date for analysis in DD/MM/YYYY format. Defaults to today.")
    ayanamsa: Optional[str] = Field("LAHIRI", description="Ayanamsa system (LAHIRI, RAMAN, KP, TROPICAL)")

class VastuObject(BaseModel):
    zone: str
    type: str
    angle: Optional[float] = Field(None, description="Precise angle in degrees (0-360) for 32-zone analysis")

class EliteVastuRequest(BaseModel):
    birth_details: BirthDetails
    vastu_objects: List[VastuObject]
    user_intent: Optional[str] = None

class LifeEvent(BaseModel):
    id: str
    title: str
    date: str
    description: Optional[str] = None

class RectificationRequest(BaseModel):
    birth_details: BirthDetails
    gender: str = Field(..., description="male or female")
    events: Optional[List[LifeEvent]] = []

class AIRequest(BaseModel):
    context: str = Field(..., description="Context of the report (e.g. 'period', 'dasha', 'general')")
    data: Dict = Field(..., description="Chart or analysis data to interpret")
    query: Optional[str] = Field(None, description="User question for chat mode")
    llm_config: Optional[Dict] = Field(None, description="Optional overrides for model selection (provider, model_name, temp)")

class RatingRequest(BaseModel):
    date: str # YYYY-MM-DD
    rating: int = Field(..., ge=1, le=5)
    feedback: Optional[str] = None

class LifeTimelineRequest(BaseModel):
    birth_details: BirthDetails
    start_year: int = Field(..., description="Start year for timeline", example=2026)
    end_year: int = Field(..., description="End year for timeline", example=2031)

class PredictionRequest(BaseModel):
    birth_details: BirthDetails
    categories: Optional[List[str]] = Field(None, description="Prediction categories: marriage, career, wealth, health, children")

class LifePredictorRequest(BaseModel):
    birth_details: BirthDetails
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    houses: Optional[List[int]] = None
    planets: Optional[List[str]] = None
    categories: Optional[List[str]] = None
