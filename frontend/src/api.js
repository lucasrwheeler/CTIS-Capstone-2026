export const BASE = "https://4w2rvps9e4.execute-api.us-east-1.amazonaws.com/prod";

console.log("USING API BASE =", BASE);

// ===============================
// Degree Audit
// ===============================
export async function getDegreeAudit(degree, completed) {
  return fetch(`${BASE}/degree_audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ degree, completed })
  }).then(r => r.json());
}

// ===============================
// Eligibility
// ===============================
export async function getEligibility(course_id, completed) {
  return fetch(`${BASE}/eligibility`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ course_id, completed })
  }).then(r => r.json());
}

// ===============================
// Planner
// ===============================
export async function getPlan(payload) {
  return fetch(`${BASE}/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(r => r.json());
}

// ===============================
// Courses
// ===============================
export async function getCourses() {
  const res = await fetch(`${BASE}/courses`);

  if (!res.ok) {
    throw new Error("Failed to fetch courses");
  }

  const data = await res.json();

  // Normal case
  if (Array.isArray(data)) {
    return data;
  }

  // API Gateway wrapped response
  if (data.body) {
    try {
      const parsed = JSON.parse(data.body);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

// ===============================
// Professors (list)
// ===============================
export async function getProfessors() {
  const res = await fetch(`${BASE}/professors`);
  const data = await res.json();

  // API Gateway wrapped response
  if (data.body) {
    try {
      const parsed = JSON.parse(data.body);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error("Failed to parse professors body:", err);
      return [];
    }
  }

  // Normal case
  return Array.isArray(data) ? data : [];
}

// ===============================
// Single Professor
// ===============================
export async function getProfessor(name) {
  const url = `${BASE}/professors/${encodeURIComponent(name)}`;
  console.log("Fetching professor:", url);

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch professor");
  }

  const data = await res.json();

  // API Gateway wrapped response
  if (data.body) {
    try {
      return JSON.parse(data.body);
    } catch (err) {
      console.error("Failed to parse professor body:", err);
      return null;
    }
  }

  return data;
}