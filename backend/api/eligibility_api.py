from fastapi import APIRouter, Query
from services.eligibility_service import get_eligible_courses

router = APIRouter(prefix="/eligible", tags=["Eligibility"])

@router.get("/")
def eligible(completed: list[str] = Query([])):
    return get_eligible_courses(completed)