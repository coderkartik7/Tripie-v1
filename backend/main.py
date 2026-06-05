from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Import routers
from routers.itinerary import router as itinerary_router
from routers.hotels import router as hotels_router
from routers.flights import router as flights_router
from routers.weather import router as weather_router
from routers.safety import router as safety_router
from routers.voice import router as voice_router

app = FastAPI(
    title="Tripie API",
    description="Backend API for the Tripie travel planning app",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(itinerary_router)
app.include_router(hotels_router)
app.include_router(flights_router)
app.include_router(weather_router)
app.include_router(safety_router)
app.include_router(voice_router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "Welcome to Tripie API. Go to /docs for Swagger documentation."
    }
