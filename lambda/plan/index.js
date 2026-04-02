const { getClient } = require('./db');
const { getPrereqs } = require('./eligibilitySQL');
const { getSemesterAvailability } = require('./semesterSQL');
const { getAllCourses } = require('./coursesSQL');

// Scoring function
function scoreCourse(course, prereqMap, requirementMap) {
  let score = 0;

  const type = requirementMap[course];

  if (type === "Core") score += 200;
  else if (type === "Required") score += 150;
  else if (type === "Internship") score += 50;

  const unlocks = Object.values(prereqMap).filter(list => list.includes(course)).length;
  if (unlocks >= 3) score += 50;
  else if (unlocks >= 1) score += 20;

  if (course.startsWith("CTIS 3")) score += 10;

  if (course === "CTIS 480") score -= 999;

  return score;
}

function isEligible(prereqs, completed) {
  if (!prereqs || prereqs.length === 0) return true;

  return prereqs.every(group => {
    if (Array.isArray(group)) {
      // OR-group
      return group.some(req => completed.includes(req));
    }

    if (typeof group === "string") {
      // Handle "A OR B" style
      if (group.toUpperCase().includes(" OR ")) {
        const parts = group
          .split(/OR/i)
          .map(s => s.trim())
          .filter(Boolean);
        return parts.some(req => completed.includes(req));
      }

      // Handle "A, B" style
      if (group.includes(",")) {
        const parts = group.split(",").map(s => s.trim());
        return parts.some(req => completed.includes(req));
      }

      // Simple single-course prereq
      return completed.includes(group);
    }

    if (group === null || group === undefined) return true;

    return completed.includes(group);
  });
}

// Normalize term values into an array of clean strings
function normalizeTerms(terms) {
  if (!terms) return [];

  if (Array.isArray(terms)) {
    return terms.map(t => String(t).trim());
  }

  if (typeof terms === "string") {
    return terms
      .replace(/&/g, ",")
      .replace(/\//g, ",")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
  }

  return [];
}

exports.handler = async (event) => {
  // CORS preflight
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
    console.log("COMPLETED RECEIVED:", completed);
    console.log("UPCOMING TERM:", upcomingTerm);

    // Degree requirements
    const degreeReqRes = await client.query(
      "SELECT course_id, requirement_type FROM degree_requirements WHERE degree = $1",
      [degree]
    );

    // Only count Core / Required / Internship as "degree courses" for planning
    const allowedTypes = ["Core", "Required", "Internship"];
    const allowedCourses = degreeReqRes.rows
      .filter(r => allowedTypes.includes(r.requirement_type))
      .map(r => r.course_id);

    console.log("ALLOWED COURSES FOR DEGREE:", allowedCourses);

    const allCourses = await getAllCourses(client);

    // requirementMap: course_id -> requirement_type
    const requirementMap = {};
    for (const row of degreeReqRes.rows) {
      requirementMap[row.course_id] = row.requirement_type;
    }

    // prereqMap: course_id -> prereq structure
    const prereqMap = {};
    for (const course of allCourses) {
      const prereqList = await getPrereqs(client, course);
      prereqMap[course] = prereqList;
    }



    // Start with all courses not yet completed
    let recommendedPool = allCourses.filter(c => !completed.includes(c));

    // Filter to only courses that belong to this degree (Core/Required/Internship)
    recommendedPool = recommendedPool.filter(c => allowedCourses.includes(c));

    // Remove capstone unless near graduation
    const coreCompleted = completed.filter(c => c.startsWith("CTIS")).length;
    const nearGrad = coreCompleted >= Math.floor(allCourses.length * 0.75);

    if (!nearGrad) {
      recommendedPool = recommendedPool.filter(c => c !== "CTIS 480");
    }

    // Filter by term availability (with robust parsing)
    const termFilteredPool = [];
    for (const course of recommendedPool) {
      const terms = await getSemesterAvailability(client, course);
      const termList = normalizeTerms(terms);

      if (termList.includes(upcomingTerm)) {
        termFilteredPool.push(course);
      }
    }

    // Eligible now (using updated eligibility logic)
    const eligibleNow = termFilteredPool.filter(course => {
      const prereqs = prereqMap[course] || [];
      return isEligible(prereqs, completed);
    });

    // Score only term-filtered, allowed courses
    const scored = termFilteredPool
      .filter(c => allowedCourses.includes(c))
      .map(course => ({
        course,
        score: scoreCourse(course, prereqMap, requirementMap)
      }));

    scored.sort((a, b) => b.score - a.score);

    // Recommended must be a subset of eligibleNow
    const eligibleScored = scored.filter(x => eligibleNow.includes(x.course));
    const topRecommended = eligibleScored.slice(0, 4).map(x => x.course);

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