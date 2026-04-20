const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
  try {
    const method = event.httpMethod;
    const path = event.path || "";

    const cors = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "*"
    };

    if (method === "OPTIONS") {
      return { statusCode: 200, headers: cors, body: "" };
    }

    // ─── GET /professors ─────────────────────────────────────────────────────
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
        ORDER BY p.name;
      `);
      return { statusCode: 200, headers: cors, body: JSON.stringify(result.rows) };
    }

    // ─── /professors/{name}/profile routes ───────────────────────────────────
    const profileMatch = path.match(/\/professors\/([^/]+)\/profile$/);

    if (profileMatch) {
      const profName = decodeURIComponent(profileMatch[1]);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS professor_profiles (
          professor_name VARCHAR(255) PRIMARY KEY,
          bio            TEXT,
          email          VARCHAR(255),
          office         VARCHAR(255),
          office_hours   TEXT,
          website        VARCHAR(500),
          research_interests TEXT,
          updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // GET — public, no auth needed
      if (method === "GET") {
        const result = await pool.query(
          `SELECT professor_name, bio, email, office, office_hours, website, research_interests, updated_at
           FROM professor_profiles WHERE professor_name = $1`,
          [profName]
        );
        const row = result.rows[0] || { professor_name: profName };
        return { statusCode: 200, headers: cors, body: JSON.stringify(row) };
      }

      // POST — requires Cognito auth; professor can only edit their own profile
      if (method === "POST") {
        const claims = event.requestContext?.authorizer?.claims || {};
        const tokenRole = claims["custom:role"] || "";
        const tokenProfName = claims["custom:professor_name"] || "";

        if (tokenRole !== "professor") {
          return { statusCode: 403, headers: cors, body: JSON.stringify({ error: "Only professors can edit profiles." }) };
        }
        if (tokenProfName !== profName) {
          return { statusCode: 403, headers: cors, body: JSON.stringify({ error: "You can only edit your own profile." }) };
        }

        const body = typeof event.body === "string" ? JSON.parse(event.body) : (event.body || {});
        const { bio = "", email = "", office = "", office_hours = "", website = "", research_interests = "" } = body;

        const exists = await pool.query("SELECT name FROM professors WHERE name = $1", [profName]);
        if (exists.rows.length === 0) {
          return { statusCode: 404, headers: cors, body: JSON.stringify({ error: "Professor not found." }) };
        }

        await pool.query(`
          INSERT INTO professor_profiles
            (professor_name, bio, email, office, office_hours, website, research_interests, updated_at)
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

    // ─── GET /professors/{name} ───────────────────────────────────────────────
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
        GROUP BY p.name, p.department, p.role;
      `, [profName]);

      if (result.rows.length === 0) {
        return { statusCode: 404, headers: cors, body: JSON.stringify({ error: "Professor not found" }) };
      }
      return { statusCode: 200, headers: cors, body: JSON.stringify(result.rows[0]) };
    }

    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Unsupported route", path }) };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Internal server error", details: err.message })
    };
  }
};