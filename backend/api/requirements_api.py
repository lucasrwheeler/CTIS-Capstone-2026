from fastapi import APIRouter
from services.requirements_service import get_remaining_requirements

router = APIRouter(prefix="/requirements", tags=["Requirements"])

@router.get("/remaining")
def remaining(major: str, completed: list[str]):
    return get_remaining_requirements(major, completed)