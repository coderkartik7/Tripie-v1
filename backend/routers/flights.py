from fastapi import APIRouter, HTTPException, Query, status
from services.flight_service import flight_service
from typing import Optional

router = APIRouter(prefix="/api/flights", tags=["flights"])


@router.get("", status_code=status.HTTP_200_OK)
async def get_flights(
    origin: str = Query(..., description="Origin city name"),
    destination: str = Query(..., description="Destination city name"),
    date: str = Query(..., description="Flight date in YYYY-MM-DD format"),
    adults: Optional[int] = Query(1, ge=1, description="Number of adult passengers"),
):
    if not origin.strip() or not destination.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both origin and destination are required.",
        )

    if not date.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Date parameter is required (YYYY-MM-DD format).",
        )

    try:
        flights = await flight_service.search_flights(
            origin.strip(),
            destination.strip(),
            date.strip(),
            adults or 1,
        )
        return flights
    except Exception as ex:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch flights: {str(ex)}",
        )
