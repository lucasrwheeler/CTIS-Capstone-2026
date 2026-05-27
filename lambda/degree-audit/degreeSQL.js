/**
 * @file degreeSQL.js
 * @description Database query layer for fetching degree requirements from RDS.
 *
 * Queries the `degree_requirements` table and returns requirements grouped
 * by their requirement_type (Core, Elective, Internship) so the audit
 * engine can process each category independently.
 *
 * @module degreeSQL
 */

/**
 * Fetches all course requirements for a degree program and groups them
 * by requirement type.
 *
 * Queries: SELECT requirement_type, course_id FROM degree_requirements WHERE degree = $1
 *
 * @async
 * @param {import('pg').Client} client - Active, connected PostgreSQL client
 * @param {string} degree - Program code (e.g. "CTIS_MAJOR", "CNS_MINOR")
 * @returns {Promise<Object.<string, string[]>>} Object keyed by requirement_type,
 *   each value being an array of course_ids in that category.
 *
 * @example
 * const reqs = await getRequirementsForDegree(client, "CTIS_MAJOR");
 * // Returns:
 * // {
 * //   Core:       ["CTIS 210", "CTIS 243", ...],
 * //   Elective:   ["CTIS 310", "CTIS 322", ...],
 * //   Internship: ["CTIS 290", "CTIS 390"]
 * // }
 */
async function getRequirementsForDegree(client, degree) {
  const res = await client.query(
    "SELECT requirement_type, course_id FROM degree_requirements WHERE degree = $1",
    [degree]
  );

  const grouped = {};

  for (const row of res.rows) {
    if (!grouped[row.requirement_type]) {
      grouped[row.requirement_type] = [];
    }
    grouped[row.requirement_type].push(row.course_id);
  }

  return grouped;
}

module.exports = { getRequirementsForDegree };