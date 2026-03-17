async function getPrereqGroups(client, courseId) {
  const res = await client.query(
    "SELECT prereq FROM prerequisites WHERE course_id = $1",
    [courseId]
  );

  if (res.rows.length === 0) return [];

  return res.rows.map(row =>
    row.prereq
      .split(" OR ")
      .map(s => s.trim())
  );
}

async function checkEligibilitySQL(client, courseId, completed) {
  const completedSet = new Set(completed);

  const groups = await getPrereqGroups(client, courseId);

  if (groups.length === 0) {
    return {
      course_id: courseId,
      eligible: true,
      missing: [],
      explanation: "No prerequisites."
    };
  }

  const missing = [];

  for (const group of groups) {
    const satisfied = group.some(opt => completedSet.has(opt));
    if (!satisfied) missing.push(group);
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

module.exports = {
  getPrereqGroups,
  checkEligibilitySQL
};