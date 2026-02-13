GET_REQUIREMENTS = """
SELECT requirement_type, course_id
FROM degree_requirements
WHERE degree = %s;
"""

GET_PREREQS = """
SELECT prereq
FROM prerequisites
WHERE course_id = %s;
"""

GET_ALL_COURSES = """
SELECT course_id
FROM courses;
"""

from backend.db.connection import get_connection

GET_COURSES_FOR_DEGREE = """
SELECT dr.course_id, c.credits
FROM degree_requirements dr
JOIN courses c ON dr.course_id = c.course_id
WHERE dr.degree = %s;
"""

def get_courses_for_degree(degree: str):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(GET_COURSES_FOR_DEGREE, (degree,))
    rows = cur.fetchall()

    cur.close()
    conn.close()

    return [{"course_id": r[0], "credits": int(r[1])} for r in rows]
