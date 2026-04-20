from typing import List, Dict
from backend.services.prerequisite_engine import evaluate_eligibility
from backend.db.connection import get_connection

def get_all_course_ids() -> List[str]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT course_id FROM courses ORDER BY course_id;")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [r[0] for r in rows]

def get_next_courses(completed_courses: List[str]) -> List[Dict]:
    """
    Returns a list of courses the student is eligible to take next.
    Each item includes:
    - course_id
    - eligible (always True)
    - missing (should be empty)
    - all_prerequisites
    """
    completed_set = set(c.upper().strip() for c in completed_courses)
    all_courses = get_all_course_ids()

    next_courses = []

    for course_id in all_courses:
        if course_id in completed_set:
            continue  # skip courses already taken

        result = evaluate_eligibility(course_id, completed_courses)

        if result["eligible"]:
            next_courses.append(result)

    return next_courses