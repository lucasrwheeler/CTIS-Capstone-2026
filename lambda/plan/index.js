// /lambda/plan/index.js

const { GRAPH, getAllDependencies } = require('./dependencyGraph');
const { canTakeInTerm } = require('./semesterLogic');
const { removeCompleted, sortByDependencyDepth } = require('./utils');

exports.handler = async (event) => {
  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    const { completed, upcomingTerm } = body || {};

    if (!completed) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing 'completed' field." })
      };
    }

    const term = upcomingTerm || "Fall";

    const allCourses = Object.keys(GRAPH);
    const remaining = removeCompleted(allCourses, completed);

    const eligibleThisTerm = remaining.filter(c =>
      canTakeInTerm(c, completed, term)
    );

    const sorted = sortByDependencyDepth(eligibleThisTerm, getAllDependencies);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        upcomingTerm: term,
        recommended_courses: sorted
      })
    };

  } catch (err) {
    console.error("Plan Lambda error:", err);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal server error." })
    };
  }
};