from db.connection import get_connection
from db.queries import GET_PREREQS

def get_prerequisites(course_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(GET_PREREQS, (course_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [r[0] for r in rows]