// /lambda/plan/semesterLogic.js

const { getSemesterAvailability } = require('../eligibility/semesterAvailability');
const { checkEligibility } = require('../eligibility/prereqs');

function canTakeInTerm(courseId, completed, term) {
  const eligible = checkEligibility(courseId, completed).eligible;
  if (!eligible) return false;

  const offered = getSemesterAvailability(courseId);
  return offered.includes(term);
}

module.exports = {
  canTakeInTerm
};