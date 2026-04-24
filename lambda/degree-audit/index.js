const { getClient } = require('./db');
const { buildAudit } = require('./auditLogic');
const { calculateDistinctCreditsSQL } = require('./distinctSQL');
const { askBedrock } = require('./bedrock');

const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
};

function respond(statusCode, body) {
  return { statusCode, headers: HEADERS, body: JSON.stringify(body) };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return respond(200, "");
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
        return respond(400, { error: "Invalid JSON in request body." });
      }
    }

    // ─── AI ADVISOR MODE ─────────────────────────────────────────────────────
    if (body.aiMode) {
      const { question, degree, completed = [] } = body;

      if (!question) {
        return respond(400, { error: "Question is required." });
      }

      let relevantIds = [];
      let reqContext = "";

      if (degree) {
        const reqRes = await client.query(
          `SELECT course_id, requirement_type FROM degree_requirements WHERE degree = $1`,
          [degree]
        );
        relevantIds = reqRes.rows.map(r => r.course_id);
        reqContext = `\nDegree requirements for ${degree}:\n` +
          reqRes.rows.map(r => `  ${r.course_id} (${r.requirement_type})`).join("\n");
      }

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

      const completedSet = new Set(completed);
      const sorted = [
        ...coursesRes.rows.filter(c => completedSet.has(c.course_id)),
        ...coursesRes.rows.filter(c => !completedSet.has(c.course_id)),
      ].slice(0, 35);

      const catalogContext = sorted.map(c =>
        `${c.course_id}: "${c.title}" — ${c.credits} cr, ${c.term_offered}` +
        (c.prerequisites?.length ? `, prereqs: ${c.prerequisites.join(", ")}` : "")
      ).join("\n");

      const completedContext = completed.length > 0
        ? `Student completed: ${completed.join(", ")}`
        : "Student has not listed completed courses.";

      const prompt = `You are an academic advisor at Guilford College for the CTIS and CNS department. Be concise, friendly, and specific. Use course IDs when mentioning courses. If you cannot answer from the context, say so honestly.

${completedContext}
${reqContext}

Course catalog (relevant):
${catalogContext}

Student question: ${question}`;

      console.log(`AI prompt length: ${prompt.length} chars`);

      const answer = await askBedrock(prompt, 1500);
      return respond(200, { answer });
    }

    // ─── DISTINCT CREDIT MODE ─────────────────────────────────────────────────
    if (body.programA && body.programB) {
      const result = await calculateDistinctCreditsSQL(client, body.programA, body.programB);
      return respond(200, result);
    }

  // ─── DEGREE AUDIT MODE ────────────────────────────────────────────────────
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
    await client.end();
  }
};