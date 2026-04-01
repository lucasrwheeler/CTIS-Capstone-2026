const { getClient } = require('./db');
const { buildAudit } = require('./auditLogic');
const { calculateDistinctCreditsSQL } = require('./distinctSQL');

exports.handler = async (event) => {
  const client = getClient();

  console.log("DEPLOYED VERSION:", new Date().toISOString());

  try {
    await client.connect();

    // SAFELY PARSE BODY
    let body = {};
    if (event && event.body) {
      try {
        body = typeof event.body === "string"
          ? JSON.parse(event.body)
          : event.body;
      } catch (err) {
        console.error("JSON parse error:", err);
        return {
          statusCode: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
          },
          body: JSON.stringify({ error: "Invalid JSON in request body." })
        };
      }
    }

    // DISTINCT CREDIT MODE
    if (body.programA && body.programB) {
      const result = await calculateDistinctCreditsSQL(
        client,
        body.programA,
        body.programB
      );

      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
        },
        body: JSON.stringify(result)
      };
    }

    // DEGREE AUDIT MODE
    if (!body.degree || !body.completed) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
        },
        body: JSON.stringify({
          error:
            "Missing required fields. Provide either {degree, completed} or {programA, programB}."
        })
      };
    }

    console.log("DEBUG DEGREE:", body.degree);
    console.log("DEBUG COMPLETED:", body.completed);

    // ⭐ Normalize Cyber naming
    let degree = body.degree;
    if (degree === "CYBER_MAJOR") degree = "CNS_MAJOR";
    if (degree === "CYBER_MINOR") degree = "CNS_MINOR";

    const audit = await buildAudit(client, degree, body.completed);

    audit.explanation =
      "AI explanation temporarily disabled due to Bedrock quota limits.";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
      },
      body: JSON.stringify(audit)
    };

  } catch (err) {
    console.error("Degree Audit Lambda error:", err);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
      },
      body: JSON.stringify({ error: err.message })
    };

  } finally {
    await client.end();
  }
};