async function getAllCourses(client) {
  const res = await client.query("SELECT course_id FROM courses");
  return res.rows.map(r => r.course_id);
}

module.exports = { getAllCourses };