/**
 * @file coursesSQL.js
 * @description Database query for the course planner's eligible course pool.
 *
 * Returns all plannable CTIS course IDs, explicitly excluding special-purpose
 * courses that should never appear in an automated semester plan:
 *
 *   CTIS 104 — Elementary Electronics (non-standard track)
 *   CTIS 140 — Special topics placeholder
 *   CTIS 150 — Special topics
 *   CTIS 230 — Web Design (elective, not part of standard plan)
 *   CTIS 290 — Internship I (scheduled separately, not algorithmically)
 *   CTIS 360 — Independent Study
 *   CTIS 390 — Internship II
 *   CTIS 460 — Independent Study
 *   CTIS 490 — Departmental Honors
 *
 * Results are ordered by level (100s before 200s, etc.) and then alpha,
 * which ensures the planner's prerequisite chain respects course sequencing.
 *
 * @module coursesSQL (plan)
 */

/**
 * Returns all course IDs eligible for automated semester planning.
 *
 * Filters to CTIS-prefix courses and excludes special/internship/independent
 * study courses that don't fit into automated scheduling logic.
 *
 * @async
 * @param {import('pg').Client} client - Active, connected PostgreSQL client
 * @returns {Promise<string[]>} Array of plannable course IDs, ordered by level then alpha
 *
 * @example
 * const courses = await getAllCourses(client);
 * // Returns: ["CTIS 210", "CTIS 221", "CTIS 243", ..., "CTIS 471"]
 */
async function getAllCourses(client) {
  const res = await client.query(`
    SELECT course_id
    FROM courses
    WHERE course_id LIKE 'CTIS %'
      AND course_id NOT IN (
        'CTIS 104',
        'CTIS 140',
        'CTIS 150',
        'CTIS 230',
        'CTIS 290',
        'CTIS 360',
        'CTIS 390',
        'CTIS 460',
        'CTIS 490'
      )
    ORDER BY level, course_id
  `);

  return res.rows.map(r => r.course_id);
}

module.exports = { getAllCourses };