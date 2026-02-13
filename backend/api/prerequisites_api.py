from fastapi import APIRouter
from backend.services.prerequisites_service import get_prerequisites

router = APIRouter(prefix="/prerequisites", tags=["Prerequisites"])

@router.get("/{course_id}")
def prerequisites_endpoint(course_id: str):
    return get_prerequisites(course_id)