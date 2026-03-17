async function getSemesterAvailability(client, courseId) {
  const res = await client.query(
    "SELECT semester FROM semester_offerings WHERE course_id = $1",
    [courseId]
  );
  return res.rows.map(r => r.semester);
}

module.exports = { getSemesterAvailability };