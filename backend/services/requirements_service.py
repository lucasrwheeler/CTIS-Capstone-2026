from db.connection import get_connection

GET_REQUIRED = """
    SELECT course_id
    FROM degree_requirements
    WHERE major = %s AND requirement_type = 'required';
"""

GET_ELECTIVES = """
    SELECT course_id
    FROM degree_requirements
    WHERE major = %s AND requirement_type = 'elective';
"""

def get_remaining_requirements(major: str, completed: list[str]):
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

    # If major doesn't exist in DB
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