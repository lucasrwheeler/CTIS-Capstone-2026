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
// Distinct Calculation
// ===============================
export async function getDistinctCredits(programA, programB) {
  const res = await fetch(`${BASE}/degree_audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ programA, programB })
  });
  const data = await res.json();
  if (data.body) {
    try { return JSON.parse(data.body); } catch { return data; }
  }
  return data;
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
// AI Advisor (Bedrock)
// ===============================
export async function getAIAdvice(question, degree = "", completed = []) {
  const res = await fetch(`${BASE}/degree_audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ aiMode: true, question, degree, completed })
  });
  const data = await res.json();
  if (data.body) {
    try { return JSON.parse(data.body); } catch { return data; }
  }
  return data;
}

// ===============================
// Courses
// ===============================
export async function getCourses() {
  const res = await fetch(`${BASE}/courses`);
  if (!res.ok) throw new Error("Failed to fetch courses");
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (data.body) {
    try {
      const parsed = JSON.parse(data.body);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }
  return [];
}

// ===============================
// Professors (list)
// ===============================
export async function getProfessors() {
  const res = await fetch(`${BASE}/professors`);
  const data = await res.json();
  if (data.body) {
    try {
      const parsed = JSON.parse(data.body);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error("Failed to parse professors body:", err);
      return [];
    }
  }
  return Array.isArray(data) ? data : [];
}

// ===============================
// Single Professor
// ===============================
export async function getProfessor(name) {
  const url = `${BASE}/professors/${encodeURIComponent(name)}`;
  console.log("Fetching professor:", url);
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch professor");
  const data = await res.json();
  if (data.body) {
    try { return JSON.parse(data.body); }
    catch (err) { console.error("Failed to parse professor body:", err); return null; }
  }
  return data;
}

// ===============================
// Professor Extended Profile
// ===============================
export async function getProfessorProfile(name) {
  const res = await fetch(`${BASE}/professors/${encodeURIComponent(name)}/profile`);
  const data = await res.json();
  if (data.body) {
    try { return JSON.parse(data.body); } catch { return data; }
  }
  return data;
  
}

// ===============================
// User Progress (cross-device)
// ===============================
export async function getUserProgress(idToken) {
  const res = await fetch(`${BASE}/user/progress`, {
    headers: { "Authorization": idToken }
  });
  if (!res.ok) throw new Error("Failed to fetch progress");
  const data = await res.json();
  if (data.body) { try { return JSON.parse(data.body); } catch { return data; } }
  return data;
}

export async function saveUserProgress(data, idToken) {
  try {
    await fetch(`${BASE}/user/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": idToken },
      body: JSON.stringify(data)
    });
  } catch { /* fail silently — localStorage is always the fallback */ }
}

// idToken is the Cognito ID token — required for POST
export async function updateProfessorProfile(name, profile, idToken) {
  const res = await fetch(`${BASE}/professors/${encodeURIComponent(name)}/profile`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": idToken
    },
    body: JSON.stringify(profile)
  });
  const data = await res.json();
  if (data.body) { try { return JSON.parse(data.body); } catch { return data; } }
  return data;

  
}