from fastapi import APIRouter

router = APIRouter(prefix="/hotels", tags=["hotels"])

@router.get("/")
async def get_hotels():
    return {"message": "Hotels router working"}
