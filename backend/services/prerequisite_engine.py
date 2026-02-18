# backend/services/prerequisite_engine.py

from typing import List, Set, Dict, Optional
from backend.services.prerequisites import get_prerequisites


INSTRUCTOR_PERMISSION_TOKEN = "INSTRUCTOR PERMISSION"


def _extract_course_ids_from_prereq_expr(expr: str) -> List[str]:
    """
    Given a prereq expression like:
      - "CTIS 210"
      - "CTIS 210 OR CTIS 221"
      - "CTIS 310 OR CTIS 322 OR CTIS 345 OR INSTRUCTOR PERMISSION"
    return the list of course IDs referenced (excluding 'INSTRUCTOR PERMISSION').
    """
    parts = [p.strip() for p in expr.split(" OR ")]
    return [p for p in parts if p != INSTRUCTOR_PERMISSION_TOKEN]


def get_direct_prereqs(course_id: str) -> List[str]:
    """
    Wrapper around existing get_prerequisites() for clarity.
    Returns the raw prereq expressions from the DB.
    """
    return get_prerequisites(course_id)

def expand_prereq_chain(course_id: str, visited: Optional[Set[str]] = None) -> Set[str]:
    """
    Recursively expand all prerequisites for a course, following chains.

    Returns a set of all course_ids that are (directly or indirectly) required.
    Does NOT include 'INSTRUCTOR PERMISSION' as a course.
    """
    if visited is None:
        visited = set()

    if course_id in visited:
        return set()

    visited.add(course_id)

    result: Set[str] = set()
    direct_exprs = get_direct_prereqs(course_id)

    for expr in direct_exprs:
        course_ids = _extract_course_ids_from_prereq_expr(expr)
        for cid in course_ids:
            result.add(cid)
            result |= expand_prereq_chain(cid, visited)

    return result


def evaluate_eligibility(course_id: str, completed_courses: List[str]) -> Dict:
    """
    Evaluate whether a student is eligible to take `course_id`
    given a list of completed course_ids.

    Rules:
    - Multiple rows in prerequisites table = AND (all must be satisfied).
    - Within a single row, "A OR B OR C" = OR group (at least one must be satisfied).
    - 'INSTRUCTOR PERMISSION' is treated as a valid option in the OR text,
      but NOT automatically satisfied. If none of the options (including permission)
      are in completed_courses, the whole expression is considered missing.
    """
    direct_exprs = get_direct_prereqs(course_id)
    missing_requirements: List[str] = []

    for expr in direct_exprs:
        parts = [p.strip() for p in expr.split(" OR ")]

        # OR group
        if len(parts) > 1:
            # If any option (including INSTRUCTOR PERMISSION) is in completed, it's satisfied.
            if not any(p in completed_courses for p in parts):
                # None of the options satisfied → this whole OR expression is missing.
                missing_requirements.append(expr)
        else:
            # Simple single-course prereq
            prereq_course = parts[0]
            if prereq_course not in completed_courses:
                missing_requirements.append(prereq_course)

    eligible = len(missing_requirements) == 0
    full_chain = sorted(expand_prereq_chain(course_id))

    return {
        "course_id": course_id,
        "eligible": eligible,
        "missing": missing_requirements,
        "all_prerequisites": full_chain,
        "completed": completed_courses,
    }