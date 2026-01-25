from pydantic import BaseModel, Field
from typing import List, Optional

class BirthDetails(BaseModel):
    date_str: str = Field(..., description="Date of birth in DD/MM/YYYY format", example="31/12/2010")
    time_str: str = Field(..., description="Time of birth in HH:MM format (24h)", example="23:40")
    timezone_str: str = Field(..., description="Timezone offset", example="+08:00")
    location: str = Field(..., description="City Name", example="Tokyo, Japan")
    latitude: float = Field(..., example=35.65)
    longitude: float = Field(..., example=139.83)

class PlanetPosition(BaseModel):
    name: str
    longitude: float
    zodiac_sign: str
    nakshatra: str
    house_sign: str
    is_retrograde: bool

class HoroscopeResponse(BaseModel):
    birth_details: BirthDetails
    planets: List[PlanetPosition]
