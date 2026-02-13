from fastapi import APIRouter, Query
from backend.services.eligibility_service import check_eligibility

router = APIRouter(prefix="/eligibility", tags=["Eligibility"])

@router.get("/")
def eligibility_endpoint(completed: list[str] = Query([])):
    return check_eligibility(completed)