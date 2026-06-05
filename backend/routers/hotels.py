from fastapi import APIRouter, HTTPException, Query, status
from services.booking_service import booking_service
from typing import Optional

router = APIRouter(prefix="/api/hotels", tags=["hotels"])

@router.get("", status_code=status.HTTP_200_OK)
async def get_hotels_data(
    city: str,
    checkin: str,
    checkout: str,
    adults: Optional[int] = Query(2, ge=1, description="Number of adult guests")
):
    if not city or city.strip() == "":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="City query parameter is required."
        )
    if not checkin or not checkout:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both checkin and checkout parameters are required (YYYY-MM-DD format)."
        )

    try:
        hotels = await booking_service.get_hotels(city.strip(), checkin, checkout, adults)
        return hotels
    except Exception as ex:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch hotels: {str(ex)}"
        )
