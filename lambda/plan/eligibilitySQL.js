async function checkEligibility(client, courseId, completed) {
  const res = await client.query(
    "SELECT prereq FROM prerequisites WHERE course_id = $1",
    [courseId]
  );

  if (res.rows.length === 0) return true;

  for (const row of res.rows) {
    const prereqString = row.prereq;

    // Split OR groups
    const options = prereqString.split(" OR ").map(s => s.trim());

    // If ANY option is satisfied, this prereq group is satisfied
    const satisfied = options.some(opt => completed.includes(opt));

    if (!satisfied) return false;
  }

  return true;
}

module.exports = { checkEligibility };