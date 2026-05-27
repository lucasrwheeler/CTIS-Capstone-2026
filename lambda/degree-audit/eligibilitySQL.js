/**
 * @file eligibilitySQL.js
 * @description Prerequisite resolution engine used by the degree audit Lambda.
 *
 * Reads prerequisite rules from the `prerequisites` RDS table and evaluates
 * whether a student has satisfied them. Prerequisites are stored as "OR groups":
 * each row in the table is one required condition, which may itself be an
 * "A OR B" string meaning either course satisfies that condition.
 *
 * Logic summary:
 *   - ALL rows (groups) must be satisfied (AND between rows)
 *   - Within each row, ANY option satisfies it (OR between options)
 *
 * Example: CTIS 342 requires CTIS 210 AND (CTIS 243 OR CTIS 221)
 *   Stored as two rows:
 *     prereq = "CTIS 210"
 *     prereq = "CTIS 243 OR CTIS 221"
 *
 * @module eligibilitySQL (degree-audit)
 */

/**
 * Fetches prerequisite groups for a course from the database.
 *
 * Each returned array element represents one AND-required condition.
 * Each condition is itself an array of OR-alternatives (any one satisfies it).
 *
 * @async
 * @param {import('pg').Client} client   - Active, connected PostgreSQL client
 * @param {string}              courseId - Course to look up prerequisites for
 * @returns {Promise<string[][]>} Array of OR-groups. Empty array means no prerequisites.
 *
 * @example
 * const groups = await getPrereqGroups(client, "CTIS 342");
 * // Returns: [["CTIS 210"], ["CTIS 243", "CTIS 221"]]
 * // Meaning: must have CTIS 210 AND (CTIS 243 OR CTIS 221)
 */
async function getPrereqGroups(client, courseId) {
  const res = await client.query(
    "SELECT prereq FROM prerequisites WHERE course_id = $1",
    [courseId]
  );

  if (res.rows.length === 0) return [];

  // Split each "A OR B" string into an array of individual options
  return res.rows.map(row =>
    row.prereq
      .split(" OR ")
      .map(s => s.trim())
  );
}

/**
 * Checks whether a student is eligible to enroll in a course.
 *
 * Evaluates every prerequisite group for the course against the student's
 * completed courses. A group is satisfied if the student has completed
 * at least one of its OR-alternatives.
 *
 * @async
 * @param {import('pg').Client} client    - Active, connected PostgreSQL client
 * @param {string}              courseId  - Course to check eligibility for
 * @param {string[]}            completed - Array of completed course IDs
 * @returns {Promise<{
 *   course_id:   string,
 *   eligible:    boolean,
 *   missing:     string[][],
 *   explanation: string
 * }>}
 *
 * @example
 * const result = await checkEligibilitySQL(client, "CTIS 342", ["CTIS 210", "CTIS 243"]);
 * // Returns: { course_id: "CTIS 342", eligible: true, missing: [], explanation: "All prerequisites satisfied." }
 */
async function checkEligibilitySQL(client, courseId, completed) {
  const completedSet = new Set(completed);
  const groups       = await getPrereqGroups(client, courseId);

  // No prerequisites — always eligible
  if (groups.length === 0) {
    return {
      course_id:   courseId,
      eligible:    true,
      missing:     [],
      explanation: "No prerequisites."
    };
  }

  const missing = [];

  for (const group of groups) {
    // If none of the OR-alternatives are in the completed set, this group is unsatisfied
    const satisfied = group.some(opt => completedSet.has(opt));
    if (!satisfied) missing.push(group);
  }

  return {
    course_id:   courseId,
    eligible:    missing.length === 0,
    missing,
    explanation: missing.length === 0
      ? "All prerequisites satisfied."
      : "Missing prerequisite groups."
  };
}

module.exports = { getPrereqGroups, checkEligibilitySQL };