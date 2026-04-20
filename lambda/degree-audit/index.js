const { getClient } = require('./db');
const { buildAudit } = require('./auditLogic');
const { calculateDistinctCreditsSQL } = require('./distinctSQL');
const { askBedrock } = require('./bedrock');

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
      },
      body: ""
    };
  }

  const client = getClient();

  console.log("DEPLOYED VERSION:", new Date().toISOString());

  try {
    await client.connect();

    let body = {};
    if (event && event.body) {
      try {
        body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
      } catch (err) {
        console.error("JSON parse error:", err);
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" },
          body: JSON.stringify({ error: "Invalid JSON in request body." })
        };
      }
    }

    // ─── AI ADVISOR MODE ─────────────────────────────────────────────────────
    if (body.aiMode) {
      const { question, degree, completed = [] } = body;

      if (!question) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" },
          body: JSON.stringify({ error: "Question is required." })
        };
      }

      // Pull relevant catalog context from DB
      const coursesRes = await client.query(
        `SELECT c.course_id, c.title, c.description, c.credits, c.term_offered,
                array_agg(DISTINCT p.prereq_course_id) FILTER (WHERE p.prereq_course_id IS NOT NULL) AS prerequisites
         FROM courses c
         LEFT JOIN prerequisites p ON c.course_id = p.course_id
         GROUP BY c.course_id, c.title, c.description, c.credits, c.term_offered
         ORDER BY c.course_id`
      );

      let reqContext = "";
      if (degree) {
        const reqRes = await client.query(
          `SELECT course_id, requirement_type FROM degree_requirements WHERE degree = $1`,
          [degree]
        );
        reqContext = `\nDegree requirements for ${degree}:\n` +
          reqRes.rows.map(r => `  ${r.course_id} (${r.requirement_type})`).join("\n");
      }

      const catalogContext = coursesRes.rows.map(c =>
        `${c.course_id}: "${c.title}" — ${c.credits} credits, offered: ${c.term_offered}` +
        (c.prerequisites?.length ? `, prereqs: ${c.prerequisites.join(", ")}` : "")
      ).join("\n");

      const completedContext = completed.length > 0
        ? `\nStudent's completed courses: ${completed.join(", ")}`
        : "\nStudent has not provided completed courses.";

      const prompt = `You are an academic advisor at Guilford College for the CTIS (Computer Technology and Information Systems) and CNS (Cyber and Network Security Management) department.

Course catalog:
${catalogContext}
${reqContext}
${completedContext}

Be concise, friendly, and specific. Use course IDs when referring to courses. If you cannot answer from the context provided, say so honestly.

Student question: ${question}`;

      const answer = await askBedrock(prompt, 800);

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" },
        body: JSON.stringify({ answer })
      };
    }

    // ─── DISTINCT CREDIT MODE ─────────────────────────────────────────────────
    if (body.programA && body.programB) {
      const result = await calculateDistinctCreditsSQL(client, body.programA, body.programB);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" },
        body: JSON.stringify(result)
      };
    }

    // ─── DEGREE AUDIT MODE ────────────────────────────────────────────────────
    if (!body.degree || !body.completed) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" },
        body: JSON.stringify({ error: "Missing degree or completed courses." })
      };
    }

    const audit = await buildAudit(client, body.degree, body.completed);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" },
      body: JSON.stringify(audit)
    };

  } catch (err) {
    console.error("Lambda error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" },
      body: JSON.stringify({ error: err.message })
    };
  } finally {
    await client.end();
  }
};