/**
 * @file index.js (eligibility Lambda)
 * @description Lambda handler for the POST /eligibility endpoint.
 *
 * Accepts a course ID and a list of completed courses, then determines
 * whether the student meets all prerequisites to enroll in that course.
 *
 * Delegates prerequisite resolution to eligibilitySQL, which reads the
 * `prerequisites` table and applies AND/OR group logic.
 *
 * Request body shape:
 * {
 *   "course_id": "CTIS 342",
 *   "completed": ["CTIS 210", "CTIS 243"]
 * }
 *
 * Response body shape:
 * {
 *   "course_id":   "CTIS 342",
 *   "eligible":    true,
 *   "missing":     [],
 *   "explanation": "All prerequisites satisfied."
 * }
 *
 * @module eligibility
 * @requires ./db             - PostgreSQL client factory
 * @requires ./eligibilitySQL - Prerequisite evaluation logic
 */

const { getClient }          = require('./db');
const { checkEligibilitySQL } = require('./eligibilitySQL');

/** Standard CORS headers for API Gateway Lambda proxy responses. */
const HEADERS = {
  "Content-Type":                "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "OPTIONS,POST"
};

/**
 * AWS Lambda entry point for the eligibility checker.
 *
 * @async
 * @param {Object}        event          - API Gateway Lambda proxy event
 * @param {string}        event.httpMethod - HTTP verb
 * @param {string|Object} event.body     - JSON body with course_id and completed
 * @returns {Promise<{ statusCode: number, headers: Object, body: string }>}
 */
exports.handler = async (event) => {
  const client = getClient();

  try {
    await client.connect();

    // Parse request body — API Gateway delivers it as a JSON string
    const body            = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { course_id, completed } = body || {};

    // Validate required fields
    if (!course_id || !completed) {
      return {
        statusCode: 400,
        headers:    HEADERS,
        body:       JSON.stringify({ error: "Missing 'course_id' or 'completed' fields." })
      };
    }

    // Run eligibility check — evaluates all prerequisite groups against completed courses
    const result = await checkEligibilitySQL(client, course_id, completed);

    return {
      statusCode: 200,
      headers:    HEADERS,
      body:       JSON.stringify(result)
    };

  } catch (err) {
    console.error("Eligibility Lambda error:", err);
    return {
      statusCode: 500,
      headers:    HEADERS,
      body:       JSON.stringify({ error: err.message })
    };

  } finally {
    await client.end();
  }
};