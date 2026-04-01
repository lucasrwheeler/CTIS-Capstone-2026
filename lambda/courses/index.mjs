import { getClient } from "./db.js";

export const handler = async () => {
  const client = getClient();

  const normalizeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined) return [];
    if (typeof value === "string" && value.startsWith("{")) {
      return value
        .replace(/[{}]/g, "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }
    return [];
  };

  try {
    await client.connect();

    // 1. Fetch all courses
    const coursesResult = await client.query(`
      SELECT
        course_id,
        title,
        description,
        credits,
        prerequisites,
        term_offered,
        professor,
        location,
        cross_listed,
        level
      FROM courses
      ORDER BY course_id;
    `);

    // 2. Fetch all core relationships
    const coreResult = await client.query(`
      SELECT degree, course_id
      FROM degree_requirements
      WHERE requirement_type IN ('Core', 'Required', 'Internship');
    `);

    // Build map: course_id -> [degree1, degree2, ...]
    const coreMap = {};
    coreResult.rows.forEach((row) => {
      if (!coreMap[row.course_id]) coreMap[row.course_id] = [];
      coreMap[row.course_id].push(row.degree);
    });

    // 3. Normalize + annotate
    let cleaned = coursesResult.rows.map((row) => ({
      ...row,
      prerequisites: normalizeArray(row.prerequisites),
      cross_listed: normalizeArray(row.cross_listed),
      is_core: !!coreMap[row.course_id],
      core_for: coreMap[row.course_id] || [],
    }));

    // 4. Sort: core first, electives after
    cleaned.sort((a, b) => {
      if (a.is_core && !b.is_core) return -1;
      if (!a.is_core && b.is_core) return 1;
      return a.course_id.localeCompare(b.course_id);
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(cleaned),
    };

  } catch (err) {
    console.error("Error fetching courses:", err);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to fetch courses." }),
    };

  } finally {
    await client.end();
  }
};