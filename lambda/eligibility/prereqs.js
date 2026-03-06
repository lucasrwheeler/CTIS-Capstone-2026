// /lambda/eligibility/prereqs.js

const { PREREQS } = require('./utils');

function checkEligibility(courseId, completed) {
  const completedSet = new Set(completed);

  const prereqRule = PREREQS[courseId];

  if (!prereqRule) {
    return {
      course_id: courseId,
      eligible: true,
      missing: [],
      explanation: "No prerequisites."
    };
  }

  const missing = [];

  for (const group of prereqRule) {
    const satisfied = group.some(c => completedSet.has(c));

    if (!satisfied) {
      missing.push(group);
    }
  }

  return {
    course_id: courseId,
    eligible: missing.length === 0,
    missing,
    explanation:
      missing.length === 0
        ? "All prerequisites satisfied."
        : "Missing prerequisite groups."
  };
}

module.exports = { checkEligibility };