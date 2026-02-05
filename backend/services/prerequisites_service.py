from db.connection import get_connection
from db.queries import GET_PREREQS

def get_prerequisites(course_id: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(GET_PREREQS, (course_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    # If no prereqs or invalid course, return empty list
    if not rows:
        return []

    return [r[0] for r in rows]