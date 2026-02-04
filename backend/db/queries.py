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