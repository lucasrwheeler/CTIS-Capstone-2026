# backend/services/prerequisites.py

from backend.db.connection import get_db_connection
from backend.queries import GET_PREREQUISITES

def get_prerequisites(course_id: str):
    """
    Returns a list of prerequisite course IDs for the given course.
    """
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(GET_PREREQUISITES, (course_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [r[0] for r in rows] if rows else []

def check_course_eligibility(course_id: str, completed_courses: list[str]):
    """
    Returns True if the student is eligible to take the course.
    """
    pass  # Day 9 will implement this