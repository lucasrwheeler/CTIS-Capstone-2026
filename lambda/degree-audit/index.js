// /lambda/degree-audit/index.js

const { runCtisMajorAudit } = require('./ctisMajor');
const { runCnsMajorAudit } = require('./cnsMajor');
const { runCtisMinorAudit } = require('./ctisMinor');
const { runCnsMinorAudit } = require('./cnsMinor');

exports.handler = async (event) => {
  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    const { program, completed } = body || {};

    if (!program || !completed) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing 'program' or 'completed' fields." })
      };
    }

    let result;

    switch (program) {
      case "CTIS_MAJOR":
        result = runCtisMajorAudit(completed);
        break;

      case "CNS_MAJOR":
        result = runCnsMajorAudit(completed);
        break;

      case "CTIS_MINOR":
        result = runCtisMinorAudit(completed);
        break;

      case "CNS_MINOR":
        result = runCnsMinorAudit(completed);
        break;

      default:
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Invalid program identifier." })
        };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(result)
    };

  } catch (err) {
    console.error("Degree audit Lambda error:", err);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal server error." })
    };
  }
};