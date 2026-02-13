from fastapi import APIRouter, Query
from backend.services.eligibility_service import check_eligibility

router = APIRouter(prefix="/eligible", tags=["Eligibility"])

@router.get("/")
def eligible(completed: list[str] = Query([])):
    return get_eligible_courses(completed)