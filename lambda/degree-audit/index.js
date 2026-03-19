const { getClient } = require('./db');
const { buildAudit } = require('./auditLogic');
const { calculateDistinctCreditsSQL } = require('./distinctSQL');
// const { askBedrock } = require('./bedrock');  // <-- import only

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
          headers: { "Content-Type": "application/json" },
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
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(result)
      };
    }

    // DEGREE AUDIT MODE
    if (!body.degree || !body.completed) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error:
            "Missing required fields. Provide either {degree, completed} or {programA, programB}."
        })
      };
    }

    console.log("DEBUG DEGREE:", body.degree);
    console.log("DEBUG COMPLETED:", body.completed);

    const audit = await buildAudit(client, body.degree, body.completed);

    // ⭐ Bedrock call happens HERE — inside the handler
    // const explanation = await askBedrock(`
    //   You are an academic advisor. Explain this degree audit to a student:

    //   ${JSON.stringify(audit, null, 2)}
    // `);

   // audit.explanation = explanation;
   // const explanation = await askBedrock(...);
// audit.explanation = explanation;

audit.explanation = "AI explanation temporarily disabled due to Bedrock quota limits.";

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