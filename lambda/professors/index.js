/**
 * @file index.js (getProfessors Lambda)
 * @description Lambda handler for all professor-related API routes.
 *
 * Handles four distinct route patterns, all routed through API Gateway:
 *
 *   GET  /professors              - Returns all professors with their courses
 *   GET  /professors/{name}       - Returns a single professor with their courses
 *   GET  /professors/{name}/profile - Returns a professor's extended profile
 *   POST /professors/{name}/profile - Updates a professor's profile (auth required)
 *
 * Authentication on POST:
 *   Requires a valid Cognito JWT passed as the Authorization header.
 *   API Gateway validates the token via a Cognito Authorizer and injects
 *   the decoded claims into event.requestContext.authorizer.claims.
 *   Two conditions are enforced server-side:
 *     1. custom:role must equal "professor"
 *     2. custom:professor_name must match the URL parameter (own profile only)
 *
 * Database:
 *   Uses a connection pool (pg.Pool) rather than individual clients because
 *   this Lambda may handle multiple rapid GET requests in warm invocations.
 *   The professor_profiles table is created on first use if it doesn't exist.
 *
 * @module getProfessors
 * @requires pg - node-postgres
 *
 * @environment
 *   DB_HOST     - RDS PostgreSQL endpoint hostname
 *   DB_USER     - Database username
 *   DB_PASSWORD - Database password
 *   DB_NAME     - Database name
 *   DB_PORT     - Database port
 */

const { Pool } = require("pg");

/**
 * Shared connection pool — created once when the Lambda container is initialized
 * and reused across warm invocations.
 *
 * @type {import('pg').Pool}
 */
const pool = new Pool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     parseInt(process.env.DB_PORT || "5432"),
  ssl:      { rejectUnauthorized: false }
});

/**
 * Standard CORS headers returned on all responses.
 * @constant {Object} cors
 */
const cors = {
  "Content-Type":                "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "*"
};

/**
 * AWS Lambda entry point for professor routes.
 *
 * Routes are matched by inspecting event.httpMethod and event.path.
 * Path matching uses regex so that URL-encoded names (e.g. "Dr.%20Smith")
 * are handled correctly via decodeURIComponent.
 *
 * @async
 * @param {Object} event                                - API Gateway proxy event
 * @param {string} event.httpMethod                     - HTTP verb
 * @param {string} event.path                           - Full request path
 * @param {string|Object} [event.body]                  - Request body (POST only)
 * @param {Object} [event.requestContext.authorizer.claims] - Decoded Cognito JWT claims
 * @returns {Promise<{ statusCode: number, headers: Object, body: string }>}
 */
exports.handler = async (event) => {
  try {
    const method = event.httpMethod;
    const path   = event.path || "";

    // ─── CORS PREFLIGHT ────────────────────────────────────────────────────
    if (method === "OPTIONS") {
      return { statusCode: 200, headers: cors, body: "" };
    }

    // ─── GET /professors ──────────────────────────────────────────────────
    // Returns all professors joined with their assigned courses.
    // Uses LEFT JOIN so professors without courses still appear.
    // json_agg builds the courses array directly in SQL to avoid N+1 queries.
    if (method === "GET" && path.endsWith("/professors")) {
      const result = await pool.query(`
        SELECT
          p.name,
          p.department,
          p.role,
          COALESCE(
            json_agg(c.course_id ORDER BY c.course_id)
            FILTER (WHERE c.course_id IS NOT NULL),
            '[]'
          ) AS courses
        FROM professors p
        LEFT JOIN courses c ON p.name = c.professor
        GROUP BY p.name, p.department, p.role
        ORDER BY p.name
      `);
      return { statusCode: 200, headers: cors, body: JSON.stringify(result.rows) };
    }

    // ─── /professors/{name}/profile ───────────────────────────────────────
    // Matches paths ending in /professors/<name>/profile
    const profileMatch = path.match(/\/professors\/([^/]+)\/profile$/);

    if (profileMatch) {
      const profName = decodeURIComponent(profileMatch[1]);

      // Ensure the extended profile table exists — creates it on first use
      // so no separate migration script is needed for this feature
      await pool.query(`
        CREATE TABLE IF NOT EXISTS professor_profiles (
          professor_name     VARCHAR(255) PRIMARY KEY,
          bio                TEXT,
          email              VARCHAR(255),
          office             VARCHAR(255),
          office_hours       TEXT,
          website            VARCHAR(500),
          research_interests TEXT,
          updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // GET — public read, no authentication required
      if (method === "GET") {
        const result = await pool.query(
          `SELECT professor_name, bio, email, office, office_hours,
                  website, research_interests, updated_at
           FROM professor_profiles
           WHERE professor_name = $1`,
          [profName]
        );
        // Return existing profile or an empty shell so the frontend
        // can distinguish "has profile" from "no profile yet"
        const row = result.rows[0] || { professor_name: profName };
        return { statusCode: 200, headers: cors, body: JSON.stringify(row) };
      }

      // POST — authenticated write; professors can only edit their own profile
      if (method === "POST") {
        // Extract decoded JWT claims injected by API Gateway Cognito Authorizer
        const claims       = event.requestContext?.authorizer?.claims || {};
        const tokenRole    = claims["custom:role"]           || "";
        const tokenProfName = claims["custom:professor_name"] || "";

        // Role check — only professors can write profiles
        if (tokenRole !== "professor") {
          return {
            statusCode: 403,
            headers: cors,
            body: JSON.stringify({ error: "Only professors can edit profiles." })
          };
        }

        // Ownership check — professors can only edit their own profile
        if (tokenProfName !== profName) {
          return {
            statusCode: 403,
            headers: cors,
            body: JSON.stringify({ error: "You can only edit your own profile." })
          };
        }

        const body = typeof event.body === "string"
          ? JSON.parse(event.body)
          : (event.body || {});

        const {
          bio                = "",
          email              = "",
          office             = "",
          office_hours       = "",
          website            = "",
          research_interests = ""
        } = body;

        // Verify the professor exists in the main professors table
        const exists = await pool.query(
          "SELECT name FROM professors WHERE name = $1",
          [profName]
        );
        if (exists.rows.length === 0) {
          return {
            statusCode: 404,
            headers: cors,
            body: JSON.stringify({ error: "Professor not found." })
          };
        }

        // Upsert — insert if new, update all fields if existing
        await pool.query(`
          INSERT INTO professor_profiles
            (professor_name, bio, email, office, office_hours,
             website, research_interests, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
          ON CONFLICT (professor_name) DO UPDATE SET
            bio                = EXCLUDED.bio,
            email              = EXCLUDED.email,
            office             = EXCLUDED.office,
            office_hours       = EXCLUDED.office_hours,
            website            = EXCLUDED.website,
            research_interests = EXCLUDED.research_interests,
            updated_at         = NOW()
        `, [profName, bio, email, office, office_hours, website, research_interests]);

        return { statusCode: 200, headers: cors, body: JSON.stringify({ success: true }) };
      }
    }

    // ─── GET /professors/{name} ───────────────────────────────────────────
    // Returns a single professor's basic info and course list.
    const nameMatch = path.match(/\/professors\/([^/]+)$/);

    if (method === "GET" && nameMatch) {
      const profName = decodeURIComponent(nameMatch[1]);
      const result = await pool.query(`
        SELECT
          p.name,
          p.department,
          p.role,
          COALESCE(
            json_agg(c.course_id ORDER BY c.course_id)
            FILTER (WHERE c.course_id IS NOT NULL),
            '[]'
          ) AS courses
        FROM professors p
        LEFT JOIN courses c ON p.name = c.professor
        WHERE p.name = $1
        GROUP BY p.name, p.department, p.role
      `, [profName]);

      if (result.rows.length === 0) {
        return {
          statusCode: 404,
          headers: cors,
          body: JSON.stringify({ error: "Professor not found" })
        };
      }
      return { statusCode: 200, headers: cors, body: JSON.stringify(result.rows[0]) };
    }

    // No route matched
    return {
      statusCode: 400,
      headers: cors,
      body: JSON.stringify({ error: "Unsupported route", path })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Internal server error", details: err.message })
    };
  }
};