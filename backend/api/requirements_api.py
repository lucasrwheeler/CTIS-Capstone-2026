from fastapi import APIRouter, Query
from backend.services.requirements_service import get_remaining_requirements

router = APIRouter(prefix="/requirements", tags=["Requirements"])

@router.get("/remaining")
def remaining(major: str, completed: list[str] = Query([])):
    return get_remaining_requirements(major, completed)