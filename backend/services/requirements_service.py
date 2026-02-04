from db.connection import get_connection
from db.queries import GET_REQUIREMENTS

def get_remaining_requirements(major, completed):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(GET_REQUIREMENTS, (major,))
    rows = cur.fetchall()

    remaining = {
        "required": [],
        "internship": [],
        "elective": []
    }

    for req_type, course in rows:
        if course not in completed:
            remaining[req_type.lower()].append(course)

    cur.close()
    conn.close()
    return remaining