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

    // CORS headers for ALL responses
    const cors = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "*"
    };

    // -----------------------------
    // OPTIONS (CORS preflight)
    // -----------------------------
    if (method === "OPTIONS") {
      return {
        statusCode: 200,
        headers: cors,
        body: ""
      };
    }

    // -----------------------------
    // GET /professors  (list all)
    // -----------------------------
    if (method === "GET" && path.endsWith("/professors")) {
      const query = `
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
      `;

      const result = await pool.query(query);

      return {
        statusCode: 200,
        headers: cors,
        body: JSON.stringify(result.rows)
      };
    }

    // -------------------------------------
    // GET /professors/{name}  (single prof)
    // -------------------------------------
    const nameMatch = path.match(/\/professors\/([^\/]+)$/);

    if (method === "GET" && nameMatch) {
      const profName = decodeURIComponent(nameMatch[1]);

      const query = `
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
      `;

      const result = await pool.query(query, [profName]);

      if (result.rows.length === 0) {
        return {
          statusCode: 404,
          headers: cors,
          body: JSON.stringify({ error: "Professor not found" })
        };
      }

      return {
        statusCode: 200,
        headers: cors,
        body: JSON.stringify(result.rows[0])
      };
    }

    // -----------------------------
    // Unsupported route
    // -----------------------------
    return {
      statusCode: 400,
      headers: cors,
      body: JSON.stringify({ error: "Unsupported route", path })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ error: "Internal server error", details: err.message })
    };
  }
};