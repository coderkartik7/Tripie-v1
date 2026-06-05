from fastapi import APIRouter

router = APIRouter(prefix="/flights", tags=["flights"])

@router.get("/")
async def get_flights():
    return {"message": "Flights router working"}
