# backend/api/eligibility_api.py

from fastapi import APIRouter, Query
from typing import List
from pydantic import BaseModel

# Old Day 1–8 service (keep it)
from backend.services.eligibility_service import check_eligibility

# Day 9 engine
from backend.services.prerequisite_engine import evaluate_eligibility

# Day 10 explanation engine
from backend.services.explanation_engine import build_explanation


router = APIRouter(prefix="/eligibility", tags=["Eligibility"])


# ---------------------------------------------------------
# 1. OLD ENDPOINT (KEEP THIS)
# GET /eligibility/?completed=CS-101&completed=MATH-112
# ---------------------------------------------------------
@router.get("/")
def eligibility_endpoint(completed: List[str] = Query([])):
    """
    Old endpoint:
    GET /eligibility/?completed=CS-101&completed=MATH-112
    """
    return check_eligibility(completed)


# ---------------------------------------------------------
# 2. NEW DAY 9 ENDPOINT
# GET /eligibility/{course_id}
# ---------------------------------------------------------
@router.get("/{course_id}")
def eligibility_for_course(
    course_id: str,
    completed: List[str] = Query(default=[]),
):
    """
    New endpoint:
    GET /eligibility/CTIS%20440?completed=CTIS%20321&completed=CTIS%20342
    """

    # Day 9 logic
    result = evaluate_eligibility(course_id, completed)

    # Day 10 explanation
    explanation = build_explanation(result)

    return {
        "eligibility": result,
        "explanation": explanation
    }


# ---------------------------------------------------------
# 3. NEW DAY 10 POST ENDPOINT (RESTORED)
# POST /eligibility/
# ---------------------------------------------------------

class EligibilityRequest(BaseModel):
    course_id: str
    completed: list[str]


@router.post("/")
def eligibility_post(req: EligibilityRequest):
    """
    Day 10 POST endpoint:
    POST /eligibility/
    {
        "course_id": "CTIS 440",
        "completed": ["CTIS 210", "CTIS 243"]
    }
    """

    # Day 9 logic
    result = evaluate_eligibility(req.course_id, req.completed)

    # Day 10 explanation
    explanation = build_explanation(result)

    return {
        "eligibility": result,
        "explanation": explanation
    }