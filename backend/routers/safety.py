from fastapi import APIRouter, HTTPException, Query, status
from services.news_service import news_service

router = APIRouter(prefix="/api/safety", tags=["safety"])


@router.get("", status_code=status.HTTP_200_OK)
async def get_safety(
    destination: str = Query(..., description="Travel destination to check safety advisories for"),
):
    if not destination or destination.strip() == "":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Destination query parameter is required.",
        )

    try:
        return await news_service.get_safety_news(destination.strip())
    except Exception as ex:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch safety news: {str(ex)}",
        )
