const { getClient } = require('./db');
const { checkEligibility } = require('./eligibilitySQL'); 
const { getSemesterAvailability } = require('./semesterSQL');
const { getAllCourses } = require('./coursesSQL');

exports.handler = async (event) => {
  const client = getClient();

  try {
    await client.connect();

    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { completed, upcomingTerm } = body;

    const allCourses = await getAllCourses(client);

    const remaining = allCourses.filter(c => !completed.includes(c));

    const eligible = [];
    for (const course of remaining) {
      const canTake = await checkEligibility(client, course, completed);
      if (canTake) eligible.push(course);
    }

    const filtered = [];
    for (const course of eligible) {
      const terms = await getSemesterAvailability(client, course);
      if (terms.includes(upcomingTerm)) filtered.push(course);
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        upcomingTerm,
        recommended_courses: filtered
      })
    };

  } catch (err) {
    console.error("Plan Lambda error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message })
    };
  } finally {
    await client.end();
  }
};