const PROGRAM_RULES = {
  CTIS_MAJOR: {
    electives_required: 1,
    internship_required: 1,
    total_courses_required: 11,
    capstone: "CTIS 440"
  },
  CNS_MAJOR: {
    electives_required: 2,
    internship_required: 1,
    total_courses_required: 10,
    capstone: "CTIS 471"
  },
  CTIS_MINOR: {
    electives_required: 2,
    require_300_level: true,
    total_courses_required: 4
  },
  CNS_MINOR: {
    electives_required: 1,
    total_courses_required: 4
  }
};

console.log("PROGRAM_RULES LOADED:", Object.keys(PROGRAM_RULES));

module.exports = { PROGRAM_RULES };