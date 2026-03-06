// /lambda/degree-audit/distinctCredits.js

function getCoursesForProgram(program) {
  switch (program) {
    case "CTIS_MAJOR":
      return [
        "CTIS 210","CTIS 221","CTIS 243","CTIS 310","CTIS 321",
        "CTIS 322","CTIS 342","CTIS 345","CTIS 331","CTIS 370",
        "CTIS 371","CTIS 471"
      ];

    case "CNS_MAJOR":
      return [
        "CTIS 210","CTIS 221","CTIS 243","CTIS 310","CTIS 321",
        "CTIS 322","CTIS 342","CTIS 370","CTIS 371","CTIS 331",
        "CTIS 345","CTIS 471"
      ];

    case "CTIS_MINOR":
      return [
        "CTIS 243","CTIS 210","CTIS 230","CTIS 310","CTIS 321",
        "CTIS 322","CTIS 331","CTIS 342","CTIS 345"
      ];

    case "CNS_MINOR":
      return [
        "CTIS 221","CTIS 322","CTIS 371","BUS 402","CTIS 210",
        "CTIS 230","CTIS 243","CTIS 321","CTIS 331","CTIS 342",
        "CTIS 370","CTIS 471","JPS 200","JPS 333","JPS 330","PHIL 241"
      ];

    default:
      return [];
  }
}

function calculateDistinctCredits(programA, programB) {
  const aCourses = new Set(getCoursesForProgram(programA));
  const bCourses = new Set(getCoursesForProgram(programB));

  const intersection = [...aCourses].filter(c => bCourses.has(c));
  const distinct = [...new Set([...aCourses, ...bCourses])];

  const totalDistinctCredits = distinct.length * 4;

  const requiredCredits =
    (programA.includes("MAJOR") && programB.includes("MAJOR"))
      ? 64
      : 48;

  return {
    programA,
    programB,
    shared_courses: intersection,
    distinct_courses: distinct,
    total_distinct_credits: totalDistinctCredits,
    required_distinct_credits: requiredCredits,
    meets_requirement: totalDistinctCredits >= requiredCredits
  };
}

module.exports = { calculateDistinctCredits };