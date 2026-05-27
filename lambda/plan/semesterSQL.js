/**
 * @file semesterSQL.js
 * @description Database query for course semester availability.
 *
 * The `semester_offerings` table stores which semesters (Fall, Spring, Both)
 * each course is offered in. The course planner uses this to filter the
 * candidate pool to only courses available in the student's upcoming term.
 *
 * @module semesterSQL
 */

/**
 * Returns the semesters in which a course is offered.
 *
 * @async
 * @param {import('pg').Client} client   - Active, connected PostgreSQL client
 * @param {string}              courseId - Course to check availability for
 * @returns {Promise<string[]>} Array of semester strings (e.g. ["Fall"], ["Spring"], ["Fall", "Spring"])
 *
 * @example
 * const terms = await getSemesterAvailability(client, "CTIS 342");
 * // Returns: ["Fall"] — CTIS 342 is only offered in the Fall
 */
async function getSemesterAvailability(client, courseId) {
  const res = await client.query(
    "SELECT semester FROM semester_offerings WHERE course_id = $1",
    [courseId]
  );
  return res.rows.map(r => r.semester);
}

module.exports = { getSemesterAvailability };