# backend/api/eligibility_api.py

from fastapi import APIRouter, Query
from typing import List

# Your old service (keep it!)
from backend.services.eligibility_service import check_eligibility

# New Day 9 engine
from backend.services.prerequisite_engine import evaluate_eligibility

router = APIRouter(prefix="/eligibility", tags=["Eligibility"])


# -----------------------------
# OLD ENDPOINT (KEEP THIS)
# -----------------------------
@router.get("/")
def eligibility_endpoint(completed: List[str] = Query([])):
    """
    Old endpoint:
    GET /eligibility/?completed=CS-101&completed=MATH-112
    """
    return check_eligibility(completed)


# -----------------------------
# NEW DAY 9 ENDPOINT
# -----------------------------
@router.get("/{course_id}")
def eligibility_for_course(
    course_id: str,
    completed: List[str] = Query(default=[]),
):
    """
    New endpoint:
    GET /eligibility/CTIS%20440?completed=CTIS%20321&completed=CTIS%20342
    """
    return evaluate_eligibility(course_id, completed)