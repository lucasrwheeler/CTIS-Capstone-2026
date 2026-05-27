/**
 * @file index.js
 * @description Main Lambda handler for the Guilford CTIS Academic Portal degree_audit endpoint.
 *
 * This single Lambda function handles three distinct operation modes, determined
 * by the shape of the incoming POST request body:
 *
 *   1. AI Advisor Mode     — body contains { aiMode: true, question, degree?, completed? }
 *   2. Distinct Credits    — body contains { programA, programB }
 *   3. Degree Audit        — body contains { degree, completed }
 *
 * All routes share one PostgreSQL connection per invocation (opened on entry,
 * closed in the finally block) and return a uniform { statusCode, headers, body }
 * response shape compatible with AWS API Gateway Lambda proxy integration.
 *
 * @module degree_audit
 * @requires ./db          - PostgreSQL client factory
 * @requires ./auditLogic  - Degree audit computation engine
 * @requires ./distinctSQL - Distinct credit overlap calculator
 * @requires ./bedrock     - Groq AI API wrapper (named "bedrock" for legacy reasons)
 *
 * @environment
 *   DB_HOST      - RDS PostgreSQL hostname
 *   DB_USER      - Database username
 *   DB_PASSWORD  - Database password
 *   DB_NAME      - Database name
 *   DB_PORT      - Database port (default 5432)
 *   GROQ_API_KEY - Groq API key for AI advisor
 */

const { getClient }               = require('./db');
const { buildAudit }              = require('./auditLogic');
const { calculateDistinctCreditsSQL } = require('./distinctSQL');
const { getAIAdvice }             = require('./bedrock');

/**
 * Standard CORS + content-type headers returned on every response.
 * Allows the React frontend (hosted on CloudFront) to call this API
 * from any origin without browser-side CORS errors.
 *
 * @constant {Object} HEADERS
 */
const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
};

/**
 * Builds a standard API Gateway Lambda proxy response object.
 *
 * @param {number} statusCode - HTTP status code (200, 400, 500, etc.)
 * @param {Object} body       - Response payload; will be JSON-stringified
 * @returns {{ statusCode: number, headers: Object, body: string }}
 */
function respond(statusCode, body) {
  return { statusCode, headers: HEADERS, body: JSON.stringify(body) };
}

/**
 * AWS Lambda entry point.
 *
 * Receives an API Gateway proxy event, parses the request body, determines
 * which operation mode to execute, queries RDS PostgreSQL, and returns the result.
 *
 * @async
 * @param {Object} event                - API Gateway Lambda proxy event
 * @param {string} event.httpMethod     - HTTP verb (GET, POST, OPTIONS)
 * @param {string|Object} event.body    - Request body (string from API Gateway, parsed here)
 * @returns {Promise<{ statusCode: number, headers: Object, body: string }>}
 */
exports.handler = async (event) => {

  // ─── CORS PREFLIGHT ──────────────────────────────────────────────────────────
  // Browsers send an OPTIONS request before any cross-origin POST.
  // Return 200 immediately so the real request is allowed through.
  if (event.httpMethod === "OPTIONS") {
    return respond(200, "");
  }

  const client = getClient();
  console.log("DEPLOYED VERSION:", new Date().toISOString());

  try {
    await client.connect();

    // Parse request body — API Gateway delivers it as a JSON string
    let body = {};
    if (event && event.body) {
      try {
        body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
      } catch (err) {
        console.error("JSON parse error:", err);
        return respond(400, { error: "Invalid JSON in request body." });
      }
    }

    // ─── MODE 1: AI ADVISOR ──────────────────────────────────────────────────
    // Triggered when body.aiMode === true.
    // Builds a context-rich prompt from the course catalog and degree requirements,
    // then sends it to Groq's LLM and returns the natural-language answer.
    if (body.aiMode) {
      const { question, degree, completed = [] } = body;

      if (!question) {
        return respond(400, { error: "Question is required." });
      }

      // If a degree program was specified, fetch its required courses to inject
      // as structured context so the AI knows what the student needs
      let relevantIds = [];
      let reqContext  = "";

      if (degree) {
        const reqRes = await client.query(
          `SELECT course_id, requirement_type
           FROM degree_requirements
           WHERE degree = $1`,
          [degree]
        );
        relevantIds = reqRes.rows.map(r => r.course_id);
        reqContext  = `\nDegree requirements for ${degree}:\n` +
          reqRes.rows.map(r => `  ${r.course_id} (${r.requirement_type})`).join("\n");
      }

      // Fetch course catalog — scoped to degree requirements if available,
      // otherwise a broad CTIS/CNS catalog (capped at 40 rows for prompt size)
      let coursesRes;
      if (relevantIds.length > 0) {
        coursesRes = await client.query(
          `SELECT c.course_id, c.title, c.credits, c.term_offered,
                  array_agg(DISTINCT p.prereq) FILTER (WHERE p.prereq IS NOT NULL) AS prerequisites
           FROM courses c
           LEFT JOIN prerequisites p ON c.course_id = p.course_id
           WHERE c.course_id = ANY($1)
           GROUP BY c.course_id, c.title, c.credits, c.term_offered
           ORDER BY c.course_id`,
          [relevantIds]
        );
      } else {
        coursesRes = await client.query(
          `SELECT c.course_id, c.title, c.credits, c.term_offered,
                  array_agg(DISTINCT p.prereq) FILTER (WHERE p.prereq IS NOT NULL) AS prerequisites
           FROM courses c
           LEFT JOIN prerequisites p ON c.course_id = p.course_id
           WHERE c.course_id LIKE 'CTIS %' OR c.course_id LIKE 'CNS %'
           GROUP BY c.course_id, c.title, c.credits, c.term_offered
           ORDER BY c.course_id
           LIMIT 40`
        );
      }

      // Sort so completed courses appear first — gives the AI the most
      // personally relevant context at the top of the prompt
      const completedSet = new Set(completed);
      const sorted = [
        ...coursesRes.rows.filter(c =>  completedSet.has(c.course_id)),
        ...coursesRes.rows.filter(c => !completedSet.has(c.course_id)),
      ].slice(0, 35);

      // Build a readable text summary of the catalog for the prompt
      const catalogContext = sorted.map(c =>
        `${c.course_id}: "${c.title}" — ${c.credits} cr, ${c.term_offered}` +
        (c.prerequisites?.length ? `, prereqs: ${c.prerequisites.join(", ")}` : "")
      ).join("\n");

      const completedContext = completed.length > 0
        ? `Student completed: ${completed.join(", ")}`
        : "Student has not listed completed courses.";

      // Assemble the full prompt sent to the Groq LLM
      const prompt =
        `You are an academic advisor at Guilford College for the CTIS and CNS department. ` +
        `Be concise, friendly, and specific. Use course IDs when mentioning courses. ` +
        `If you cannot answer from the context, say so honestly.\n\n` +
        `${completedContext}\n${reqContext}\n\nCourse catalog (relevant):\n${catalogContext}\n\n` +
        `Student question: ${question}`;

      console.log(`AI prompt length: ${prompt.length} chars`);

      const answer = await getAIAdvice(prompt);
      return respond(200, { answer });
    }

    // ─── MODE 2: DISTINCT CREDITS CALCULATOR ─────────────────────────────────
    // Triggered when body contains both programA and programB.
    // Delegates to calculateDistinctCreditsSQL which queries RDS to find
    // credit overlap and unique credits between two degree programs.
    if (body.programA && body.programB) {
      const result = await calculateDistinctCreditsSQL(client, body.programA, body.programB);
      return respond(200, result);
    }

    // ─── MODE 3: DEGREE AUDIT ─────────────────────────────────────────────────
    // Default mode — requires body.degree and body.completed.
    // Normalizes legacy program names (CYBER_* → CNS_*) for backwards
    // compatibility with older frontend versions, then delegates to buildAudit.
    if (!body.degree || !body.completed) {
      return respond(400, { error: "Missing degree or completed courses." });
    }

    const degreeNorm =
      body.degree === "CYBER_MAJOR" ? "CNS_MAJOR" :
      body.degree === "CYBER_MINOR" ? "CNS_MINOR" : body.degree;

    const audit = await buildAudit(client, degreeNorm, body.completed);
    return respond(200, audit);

  } catch (err) {
    console.error("Lambda error:", err);
    return respond(500, { error: err.message });

  } finally {
    // Always close the DB connection — Lambda reuses execution environments,
    // so unclosed connections would accumulate and exhaust the RDS pool
    await client.end();
  }
};