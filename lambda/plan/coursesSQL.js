async function getAllCourses(client) {
  const res = await client.query(`
    SELECT course_id 
    FROM courses
    WHERE course_id LIKE 'CTIS %'
      AND course_id NOT IN (   
      'CTIS 104',
      'CTIS 140',
        'CTIS 150',
        'CTIS 230',
        'CTIS 290',
        'CTIS 360',
        'CTIS 390',
        'CTIS 460',
        'CTIS 490'
)
    ORDER BY level, course_id
  `);

  return res.rows.map(r => r.course_id);
}

module.exports = { getAllCourses };