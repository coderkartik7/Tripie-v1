from fastapi import APIRouter, HTTPException, Query, status
from services.weather_service import weather_service
from typing import Optional

router = APIRouter(prefix="/api/weather", tags=["weather"])

@router.get("", status_code=status.HTTP_200_OK)
async def get_weather_data(
    city: str,
    days: Optional[int] = Query(5, ge=1, le=7, description="Number of forecast days to return"),
    travel_date: Optional[str] = Query(None, description="Start date of travel in YYYY-MM-DD format")
):
    if not city or city.strip() == "":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="City query parameter is required."
        )

    try:
        weather_forecast = await weather_service.get_weather(city.strip(), travel_date)
        # Limit the results to the requested number of days
        return weather_forecast[:days]
    except Exception as ex:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch weather forecast: {str(ex)}"
        )
