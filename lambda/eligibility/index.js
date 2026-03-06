// /lambda/eligibility/index.js

const { checkEligibility } = require('./prereqs');
const { getNextCourses } = require('./nextCourses');

exports.handler = async (event) => {
  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    const { course_id, completed, upcomingTerm } = body || {};

    if (!course_id || !completed) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing 'course_id' or 'completed' fields." })
      };
    }

    const eligibility = checkEligibility(course_id, completed);
    const nextCourses = getNextCourses(completed, upcomingTerm || "Fall");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        eligibility,
        next_courses: nextCourses
      })
    };

  } catch (err) {
    console.error("Eligibility Lambda error:", err);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal server error." })
    };
  }
};