from fastapi import APIRouter, HTTPException, status
from models.schemas import TripRequest
from services.gemini_service import gemini_service
from datetime import datetime
import logging

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/itinerary", tags=["itinerary"])

@router.post("", status_code=status.HTTP_200_OK)
async def create_itinerary(request: TripRequest):
    # Calculate days based on start_date and end_date
    try:
        start = datetime.strptime(request.start_date.strip(), "%Y-%m-%d")
        end = datetime.strptime(request.end_date.strip(), "%Y-%m-%d")
        days = (end - start).days + 1
        if days <= 0:
            raise ValueError("End date must be on or after start date")
    except ValueError as val_err:
        logger.error(f"Date validation error: {str(val_err)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid dates provided: {str(val_err)}"
        )
    except Exception as ex:
        logger.error(f"Failed to parse dates: {str(ex)}")
        # Fallback to a default of 3 days if format doesn't match YYYY-MM-DD
        days = 3

    # Generate itinerary
    try:
        itinerary = await gemini_service.generate_itinerary(
            origin=request.origin,
            destination=request.destination,
            days=days,
            budget=request.budget,
            trip_type=request.trip_type,
            travelers=request.travelers
        )
        return itinerary
    except Exception as ex:
        logger.error(f"Error generating itinerary via Gemini service: {str(ex)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate itinerary: {str(ex)}"
        )

@router.get("")
async def get_itineraries_scaffold():
    return {"message": "Itinerary router is active"}
