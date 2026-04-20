from backend.db.connection import get_connection

def check_eligibility(completed):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        WITH completed AS (
            SELECT unnest(%s::text[]) AS course_id
        )
        SELECT c.course_id
        FROM courses c
        LEFT JOIN prerequisites p ON c.course_id = p.course_id
        GROUP BY c.course_id
        HAVING BOOL_AND(
            p.prereq IS NULL OR p.prereq IN (SELECT course_id FROM completed)
        );
    """, (completed,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [r[0] for r in rows if r[0] not in completed]