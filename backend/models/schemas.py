from pydantic import BaseModel
from typing import List, Optional

class TripRequest(BaseModel):
    destination: str
    start_date: str
    end_date: str
    budget: float
    trip_type: str
    travelers: int
    preferences: Optional[List[str]] = None

class ItineraryResponse(BaseModel):
    destination: str
    start_date: str
    end_date: str
    days: List[dict]

class HotelRequest(BaseModel):
    city: str
    check_in: str
    check_out: str
    guests: int

class FlightRequest(BaseModel):
    origin: str
    destination: str
    departure_date: str
    return_date: Optional[str] = None
    passengers: int

class WeatherRequest(BaseModel):
    city: str

class SafetyRequest(BaseModel):
    location: str

class VoiceRequest(BaseModel):
    text: str
