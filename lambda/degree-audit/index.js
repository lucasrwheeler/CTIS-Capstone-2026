const { getClient } = require('./db');
const { buildAudit } = require('./auditLogic');
const { calculateDistinctCreditsSQL } = require('./distinctSQL');

exports.handler = async (event) => {
  const client = getClient();

  try {
    await client.connect();

    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    // Distinct credit mode
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
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(result)
      };
    }

    // Degree audit mode
    const { degree, completed } = body || {};

    if (!degree || !completed) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Missing required fields. Provide either {degree, completed} or {programA, programB}."
        })
      };
    }

    const audit = await buildAudit(client, degree, completed);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(audit)
    };

  } catch (err) {
    console.error("Degree Audit Lambda error:", err);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message })
    };

  } finally {
    await client.end();
  }
};