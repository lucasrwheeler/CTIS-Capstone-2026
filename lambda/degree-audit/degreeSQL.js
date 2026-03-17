async function getRequirementsForDegree(client, degree) {
  const res = await client.query(
    "SELECT requirement_type, course_id FROM degree_requirements WHERE degree = $1",
    [degree]
  );

  const grouped = {};

  for (const row of res.rows) {
    if (!grouped[row.requirement_type]) {
      grouped[row.requirement_type] = [];
    }
    grouped[row.requirement_type].push(row.course_id);
  }

  return grouped;
}

module.exports = { getRequirementsForDegree };