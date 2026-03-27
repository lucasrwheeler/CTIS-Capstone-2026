export const BASE = "https://4w2rvps9e4.execute-api.us-east-1.amazonaws.com/prod";

export async function getDegreeAudit(degree, completed) {
  return fetch(`${BASE}/degree_audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ degree, completed })
  }).then(r => r.json());
}

export async function getEligibility(course_id, completed) {
  return fetch(`${BASE}/eligibility`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ course_id, completed })
  }).then(r => r.json());
}

export async function getPlan(payload) {
  return fetch(`${BASE}/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(r => r.json());
}

export async function getCourses() {
  const res = await fetch(`${BASE}/courses`);
  const data = await res.json();

  // If Lambda wrapped the response, unwrap it
  if (data.body) {
    return JSON.parse(data.body);
  }

  return data;
}