from fastapi import APIRouter
from services.prerequisites_service import get_prerequisites

router = APIRouter(prefix="/prerequisites", tags=["Prerequisites"])

@router.get("/{course_id:path}")
def prereqs(course_id: str):
    return get_prerequisites(course_id)