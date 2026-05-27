/**
 * @file distinctSQL.js
 * @description Distinct credits calculator for double major / minor combinations.
 *
 * Answers the question: "If I pursue Program A AND Program B simultaneously,
 * how many total distinct credits do I need?"
 *
 * Guilford College's policy: courses that satisfy requirements in both programs
 * only count once toward the combined credit total. This function queries both
 * programs' requirements, finds the overlap, and computes the distinct union.
 *
 * Credit assumption: every course in the catalog is worth 4 credits.
 * Required thresholds (Guilford policy):
 *   - Dual major combination: 64 distinct credits required
 *   - Major + minor (or dual minor): 48 distinct credits required
 *
 * @module distinctSQL
 */

/**
 * Fetches all course IDs required for a degree program.
 *
 * @async
 * @param {import('pg').Client} client - Active, connected PostgreSQL client
 * @param {string} degree              - Program code (e.g. "CTIS_MAJOR")
 * @returns {Promise<string[]>} Array of course_ids for that program
 */
async function getCoursesForProgram(client, degree) {
  const res = await client.query(
    "SELECT course_id FROM degree_requirements WHERE degree = $1",
    [degree]
  );
  return res.rows.map(r => r.course_id);
}

/**
 * Calculates distinct (non-overlapping) credit requirements for a two-program combination.
 *
 * Fetches the course lists for both programs, computes set intersection (shared)
 * and union (distinct), multiplies by 4 credits per course, then checks
 * against the applicable Guilford threshold.
 *
 * @async
 * @param {import('pg').Client} client   - Active, connected PostgreSQL client
 * @param {string}              programA - First program code  (e.g. "CTIS_MAJOR")
 * @param {string}              programB - Second program code (e.g. "CNS_MINOR")
 * @returns {Promise<{
 *   programA:                string,
 *   programB:                string,
 *   shared_courses:          string[],
 *   distinct_courses:        string[],
 *   total_distinct_credits:  number,
 *   required_distinct_credits: number,
 *   meets_requirement:       boolean
 * }>}
 *
 * @example
 * const result = await calculateDistinctCreditsSQL(client, "CTIS_MAJOR", "CNS_MINOR");
 * // Returns: {
 * //   shared_courses: ["CTIS 210", "CTIS 370"],
 * //   distinct_courses: ["CTIS 210", ..., "CNS 310", ...],
 * //   total_distinct_credits: 52,
 * //   required_distinct_credits: 48,
 * //   meets_requirement: true
 * // }
 */
async function calculateDistinctCreditsSQL(client, programA, programB) {
  const aCourses = new Set(await getCoursesForProgram(client, programA));
  const bCourses = new Set(await getCoursesForProgram(client, programB));

  // Courses that appear in both programs (counted once in the union)
  const shared = [...aCourses].filter(c => bCourses.has(c));

  // Union of both sets — every unique course across both programs
  const distinct = [...new Set([...aCourses, ...bCourses])];

  // 4 credits per course (Guilford standard course weight)
  const totalDistinctCredits = distinct.length * 4;

  // Guilford threshold: dual major = 64 credits, everything else = 48
  const requiredCredits =
    programA.includes("MAJOR") && programB.includes("MAJOR") ? 64 : 48;

  return {
    programA,
    programB,
    shared_courses:           shared,
    distinct_courses:         distinct,
    total_distinct_credits:   totalDistinctCredits,
    required_distinct_credits: requiredCredits,
    meets_requirement:        totalDistinctCredits >= requiredCredits
  };
}

module.exports = { getCoursesForProgram, calculateDistinctCreditsSQL };