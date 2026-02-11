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

def get_courses_for_degree(degree: str):
    sql = """
        SELECT dr.course_id, c.credits::int AS credits
        FROM degree_requirements dr
        JOIN courses c ON dr.course_id = c.course_id
        WHERE dr.degree = %s;
    """
    return db.query(sql, (degree,))