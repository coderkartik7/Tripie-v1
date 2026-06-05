from fastapi import APIRouter

router = APIRouter(prefix="/voice", tags=["voice"])

@router.get("/")
async def get_voice():
    return {"message": "Voice router working"}
