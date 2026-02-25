from fastapi import APIRouter
from pydantic import BaseModel
from backend.services.next_courses import get_next_courses

router = APIRouter(prefix="/next-courses", tags=["Next Courses"])

class CompletedCoursesRequest(BaseModel):
    completed: list[str]

@router.post("/")
def next_courses(req: CompletedCoursesRequest):
    return get_next_courses(req.completed)