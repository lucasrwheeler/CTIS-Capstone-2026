async function getCoursesForProgram(client, degree) {
  const res = await client.query(
    "SELECT course_id FROM degree_requirements WHERE degree = $1",
    [degree]
  );

  return res.rows.map(r => r.course_id);
}

async function calculateDistinctCreditsSQL(client, programA, programB) {
  // 1. Fetch course lists from DB
  const aCourses = new Set(await getCoursesForProgram(client, programA));
  const bCourses = new Set(await getCoursesForProgram(client, programB));

  // 2. Shared courses
  const shared = [...aCourses].filter(c => bCourses.has(c));

  // 3. Distinct courses
  const distinct = [...new Set([...aCourses, ...bCourses])];

  // 4. Credits (each course = 4 credits)
  const totalDistinctCredits = distinct.length * 4;

  // 5. Required distinct credits
  const requiredCredits =
    programA.includes("MAJOR") && programB.includes("MAJOR")
      ? 64
      : 48;

  return {
    programA,
    programB,
    shared_courses: shared,
    distinct_courses: distinct,
    total_distinct_credits: totalDistinctCredits,
    required_distinct_credits: requiredCredits,
    meets_requirement: totalDistinctCredits >= requiredCredits
  };
}

module.exports = {
  getCoursesForProgram,
  calculateDistinctCreditsSQL
};