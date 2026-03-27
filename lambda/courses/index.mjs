import { getClient } from "./db.js";

export const handler = async () => {
  const client = getClient();

  try {
    await client.connect();

    const result = await client.query(`
      SELECT DISTINCT course_id
      FROM degree_requirements
      ORDER BY course_id;
    `);

    const courses = result.rows.map((row) => row.course_id);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(courses),
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