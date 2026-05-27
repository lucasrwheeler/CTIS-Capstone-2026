/**
 * @file eligibilitySQL.js (plan Lambda)
 * @description Prerequisite evaluation utilities for the course planner.
 *
 * A simpler version of the eligibility engine used in the degree-audit Lambda.
 * The plan Lambda uses two separate functions:
 *   - getPrereqs: raw string fetch (used to build the prereqMap cache)
 *   - checkEligibility: boolean check (used in the inline isEligible function)
 *
 * Prerequisites are stored as "A OR B" strings per row in the `prerequisites`
 * table. A course is eligible when ALL rows (AND) are satisfied, where a row
 * is satisfied when ANY option (OR) is in the completed set.
 *
 * @module eligibilitySQL (plan)
 */

/**
 * Checks whether a student is eligible for a course (simple boolean version).
 *
 * Used internally to filter the planner's candidate pool. Returns a boolean
 * rather than a structured object because the planner only needs pass/fail.
 *
 * @async
 * @param {import('pg').Client} client    - Active, connected PostgreSQL client
 * @param {string}              courseId  - Course to check
 * @param {string[]}            completed - Array of completed course IDs
 * @returns {Promise<boolean>} true if all prerequisites are satisfied
 */
async function checkEligibility(client, courseId, completed) {
  const res = await client.query(
    "SELECT prereq FROM prerequisites WHERE course_id = $1",
    [courseId]
  );

  // No prerequisites — always eligible
  if (res.rows.length === 0) return true;

  for (const row of res.rows) {
    // Each row is one AND-required condition; options within are OR-separated
    const options   = row.prereq.split(" OR ").map(s => s.trim());
    const satisfied = options.some(opt => completed.includes(opt));
    if (!satisfied) return false;
  }

  return true;
}

/**
 * Fetches raw prerequisite strings for a course.
 *
 * Used by the plan Lambda to pre-build a prereqMap cache (one DB call per
 * course at startup) so individual isEligible checks don't need DB access.
 *
 * @async
 * @param {import('pg').Client} client - Active, connected PostgreSQL client
 * @param {string}              course - Course to look up
 * @returns {Promise<string[]>} Array of raw prereq strings (e.g. ["CTIS 210", "CTIS 243 OR CTIS 221"])
 */
async function getPrereqs(client, course) {
  const res = await client.query(
    "SELECT prereq FROM prerequisites WHERE course_id = $1",
    [course]
  );
  return res.rows.map(r => r.prereq);
}

module.exports = { checkEligibility, getPrereqs };