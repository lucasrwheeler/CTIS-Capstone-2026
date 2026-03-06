// /lambda/eligibility/nextCourses.js

const { PREREQS, ALL_COURSES } = require('./utils');
const { checkEligibility } = require('./prereqs');
const { getSemesterAvailability } = require('./semesterAvailability');

function getNextCourses(completed, upcomingTerm = "Fall") {
  const results = [];

  for (const course of ALL_COURSES) {
    const eligible = checkEligibility(course, completed);

    if (!eligible.eligible) continue;
    if (completed.includes(course)) continue;

    const offered = getSemesterAvailability(course);
    if (!offered.includes(upcomingTerm)) continue;

    results.push(course);
  }

  return results;
}

module.exports = { getNextCourses };