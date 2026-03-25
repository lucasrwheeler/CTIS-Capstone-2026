const { getClient } = require('./db');
const { checkEligibilitySQL } = require('./eligibilitySQL');

exports.handler = async (event) => {
  const client = getClient();

  try {
    await client.connect();

    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { course_id, completed } = body || {};

    if (!course_id || !completed) {
    return {
  statusCode: 400,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,POST"
  },
  body: JSON.stringify({ error: "Missing 'course_id' or 'completed' fields." })
};
    }

    const result = await checkEligibilitySQL(client, course_id, completed);

   return {
  statusCode: 200,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,POST"
  },
  body: JSON.stringify(result)
};

  } catch (err) {
    console.error("Eligibility Lambda error:", err);

return {
  statusCode: 500,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,POST"
  },
  body: JSON.stringify({ error: err.message })
};

  } finally {
    await client.end();
  }
};