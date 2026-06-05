from fastapi import APIRouter

router = APIRouter(prefix="/safety", tags=["safety"])

@router.get("/")
async def get_safety():
    return {"message": "Safety router working"}
