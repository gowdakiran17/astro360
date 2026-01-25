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

class KPRequest(BaseModel):
    birth_details: BirthDetails
    horary_number: Optional[int] = Field(0, description="KP Horary number (1-249)")

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
    boy: dict
    girl: dict

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

class RatingRequest(BaseModel):
    date: str # YYYY-MM-DD
    rating: int = Field(..., ge=1, le=5)
    feedback: Optional[str] = None
