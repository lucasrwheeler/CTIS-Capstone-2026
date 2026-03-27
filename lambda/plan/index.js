const { getClient } = require('./db');
const { getPrereqs } = require('./eligibilitySQL'); 
const { getSemesterAvailability } = require('./semesterSQL');
const { getAllCourses } = require('./coursesSQL');

// ⭐ Updated scoring function (Step 5B)
function scoreCourse(course, prereqMap, requirementMap) {
  let score = 0;

  const type = requirementMap[course];

  // Priority based on requirement type
  if (type === "Core") score += 200;
  else if (type === "Required") score += 150;
  else if (type === "Internship") score += 50;

  // Courses that unlock many others
  const unlocks = Object.values(prereqMap).filter(list => list.includes(course)).length;
  if (unlocks >= 3) score += 50;
  else if (unlocks >= 1) score += 20;

  // Slight boost for mid‑level CTIS 3xx
  if (course.startsWith("CTIS 3")) score += 10;

  // Capstone penalty
  if (course === "CTIS 480") score -= 999;

  return score;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
      },
      body: ""
    };
  }

  const client = getClient();

  try {
    await client.connect();

    const rawBody = event.body || event;
    const body = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;

    const { degree, completed, upcomingTerm } = body;
    console.log("DEGREE RECEIVED:", degree);

    // Fetch degree requirements
    const degreeReqRes = await client.query(
      "SELECT course_id, requirement_type FROM degree_requirements WHERE degree = $1",
      [degree]
    );

    const allowedTypes = ["Core", "Required", "Internship"];
    const allowedCourses = degreeReqRes.rows
      .filter(r => allowedTypes.includes(r.requirement_type))
      .map(r => r.course_id);

    console.log("ALLOWED COURSES FOR DEGREE:", allowedCourses);

    const allCourses = await getAllCourses(client);

    // Build requirementMap
    const requirementMap = {};
    for (const row of degreeReqRes.rows) {
      requirementMap[row.course_id] = row.requirement_type;
    }

    // Build prereq map
    const prereqMap = {};
    for (const course of allCourses) {
      const prereqList = await getPrereqs(client, course);
      prereqMap[course] = prereqList;
    }

    // Build recommended pool
    let recommendedPool = allCourses.filter(c => !completed.includes(c));

    // Filter by major
    recommendedPool = recommendedPool.filter(c => allowedCourses.includes(c));

    // Remove capstone unless near graduation
    const coreCompleted = completed.filter(c => c.startsWith("CTIS")).length;
    const nearGrad = coreCompleted >= Math.floor(allCourses.length * 0.75);

    if (!nearGrad) {
      recommendedPool = recommendedPool.filter(c => c !== "CTIS 480");
    }

    // Filter by term availability
    const termFilteredPool = [];
    for (const course of recommendedPool) {
      const terms = await getSemesterAvailability(client, course);
      if (Array.isArray(terms) && terms.includes(upcomingTerm)) {
        termFilteredPool.push(course);
      }
    }

    // Eligible now
    let eligibleNow = termFilteredPool
      .filter(c => allowedCourses.includes(c))
      .filter(course => {
        const prereqs = prereqMap[course] || [];
        return prereqs.every(req => completed.includes(req));
      });

    // Score and sort
    const scored = termFilteredPool
      .filter(c => allowedCourses.includes(c))
      .map(course => ({
        course,
        score: scoreCourse(course, prereqMap, requirementMap)
      }));

    scored.sort((a, b) => b.score - a.score);

    const topRecommended = scored.slice(0, 4).map(x => x.course);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
      },
      body: JSON.stringify({
        upcomingTerm,
        recommended_courses: topRecommended,
        eligible_now: eligibleNow
      })
    };

  } catch (err) {
    console.error("Plan Lambda error:", err);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
      },
      body: JSON.stringify({ error: err.message })
    };
  } finally {
    await client.end();
  }
};