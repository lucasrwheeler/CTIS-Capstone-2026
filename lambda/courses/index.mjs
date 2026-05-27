/**
 * @file index.mjs
 * @description Lambda handler for the GET /courses endpoint.
 *
 * Returns the full CTIS/CNS course catalog enriched with degree membership data.
 * Uses ES module syntax (`.mjs`) — this Lambda was created before the rest of
 * the backend standardized on CommonJS, hence the different file extension
 * and `export const handler` instead of `exports.handler`.
 *
 * Pipeline:
 *   1. Fetch all courses from the `courses` table (ordered by course_id)
 *   2. Fetch all Core/Required/Internship entries from `degree_requirements`
 *   3. Build a lookup map: course_id → [degree1, degree2, ...]
 *   4. Annotate each course with is_core (boolean) and core_for (array of degrees)
 *   5. Sort: core courses first, then electives, both groups alpha by course_id
 *   6. Normalize array fields that PostgreSQL may return as "{A,B}" strings
 *
 * The is_core and core_for annotations allow the frontend course list to
 * visually distinguish required courses from electives without a second API call.
 *
 * @module courses
 * @requires ./db - PostgreSQL client factory (ES module version)
 */

import { getClient } from "./db.js";

/**
 * AWS Lambda entry point — returns the full annotated course catalog.
 *
 * No request body or parameters needed — this is a pure GET endpoint.
 *
 * @async
 * @returns {Promise<{ statusCode: number, headers: Object, body: string }>}
 *   body is a JSON array of course objects, sorted core-first then alpha.
 */
export const handler = async () => {
  const client = getClient();

  /**
   * Normalizes PostgreSQL array values to a JavaScript string array.
   *
   * PostgreSQL may return array columns as:
   *   - A proper JS array (when using node-postgres array parsing)
   *   - A "{A,B,C}" string (raw PostgreSQL array literal)
   *   - null / undefined (when the column is empty)
   *
   * @param {*} value - Raw value from a PostgreSQL array column
   * @returns {string[]} Clean JavaScript array of trimmed strings
   */
  const normalizeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined) return [];
    if (typeof value === "string" && value.startsWith("{")) {
      return value
        .replace(/[{}]/g, "")
        .split(",")
        .map(v => v.trim())
        .filter(Boolean);
    }
    return [];
  };

  try {
    await client.connect();

    // ── Step 1: Fetch all courses ────────────────────────────────────────────
    const coursesResult = await client.query(`
      SELECT
        course_id,
        title,
        description,
        credits,
        prerequisites,
        term_offered,
        professor,
        location,
        cross_listed,
        level
      FROM courses
      ORDER BY course_id
    `);

    // ── Step 2: Fetch degree membership (Core/Required/Internship only) ──────
    // Electives are excluded because they aren't "required" for any specific degree
    const coreResult = await client.query(`
      SELECT degree, course_id
      FROM degree_requirements
      WHERE requirement_type IN ('Core', 'Required', 'Internship')
    `);

    // ── Step 3: Build course_id → degrees lookup map ─────────────────────────
    // A course may be Core for multiple degrees (e.g. CTIS 210 is core for both CTIS_MAJOR and CNS_MAJOR)
    const coreMap = {};
    coreResult.rows.forEach(row => {
      if (!coreMap[row.course_id]) coreMap[row.course_id] = [];
      coreMap[row.course_id].push(row.degree);
    });

    // ── Step 4: Normalize + annotate each course ─────────────────────────────
    let cleaned = coursesResult.rows.map(row => ({
      ...row,
      prerequisites: normalizeArray(row.prerequisites),
      cross_listed:  normalizeArray(row.cross_listed),
      is_core:       !!coreMap[row.course_id],          // true if required for any degree
      core_for:      coreMap[row.course_id] || [],      // which degrees require it
    }));

    // ── Step 5: Sort — core courses first, then electives, both alpha ────────
    cleaned.sort((a, b) => {
      if (a.is_core && !b.is_core) return -1;
      if (!a.is_core && b.is_core) return  1;
      return a.course_id.localeCompare(b.course_id);
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type":                "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(cleaned)
    };

  } catch (err) {
    console.error("Error fetching courses:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to fetch courses." })
    };

  } finally {
    await client.end();
  }
};