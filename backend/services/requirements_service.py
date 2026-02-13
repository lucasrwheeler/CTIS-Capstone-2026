# backend/services/requirements_service.py

from backend.queries import get_courses_for_degree
from backend.db.connection import get_connection

# SQL for requirement breakdown (will eventually move to queries.py)
GET_REQUIRED = """
SELECT course_id
FROM degree_requirements
WHERE degree = %s AND requirement_type = 'required';
"""

GET_ELECTIVES = """
SELECT course_id
FROM degree_requirements
WHERE degree = %s AND requirement_type = 'elective';
"""


def get_remaining_requirements(major: str, completed: list[str]):
    """
    Returns remaining required and elective courses for a major
    based on the student's completed courses.
    """
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(GET_REQUIRED, (major,))
    required_rows = cur.fetchall()
    required = [r[0] for r in required_rows]

    cur.execute(GET_ELECTIVES, (major,))
    elective_rows = cur.fetchall()
    electives = [r[0] for r in elective_rows]

    cur.close()
    conn.close()

    # Major not found
    if not required_rows and not elective_rows:
        return {
            "remaining_required": [],
            "remaining_electives": []
        }

    remaining_required = [c for c in required if c not in completed]
    remaining_electives = [c for c in electives if c not in completed]

    return {
        "remaining_required": remaining_required,
        "remaining_electives": remaining_electives
    }


def calculate_distinct_courses(degree_a: str, degree_b: str):
    """
    Returns distinct courses and total distinct credits
    for a combination of two degrees.
    """
    req_a = get_courses_for_degree(degree_a)
    req_b = get_courses_for_degree(degree_b)

    # Collapse duplicates
    distinct = {}

    for row in req_a:
        distinct[row["course_id"]] = row["credits"]

    for row in req_b:
        distinct[row["course_id"]] = row["credits"]

    total_credits = sum(distinct.values())

    return {
        "degree_a": degree_a,
        "degree_b": degree_b,
        "distinct_courses": list(distinct.keys()),
        "distinct_credits": total_credits
    }


def evaluate_degree_combo(degree_a: str, degree_b: str):
    """
    Applies threshold logic (48 for major+minor, 64 for double major)
    and returns whether the combination meets requirements.
    """
    result = calculate_distinct_courses(degree_a, degree_b)
    total = result["distinct_credits"]

    # Determine threshold
    if "MINOR" in degree_a or "MINOR" in degree_b:
        threshold = 48
    else:
        threshold = 64

    result["required_distinct_credits"] = threshold
    result["meets_requirement"] = total >= threshold
    result["credits_short"] = max(0, threshold - total)

    return result