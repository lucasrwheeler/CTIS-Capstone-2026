import { useState } from "react";
import { getPlan } from "../api";
import { Link } from "react-router-dom";

export default function CoursePlannerPage() {
  const [degree, setDegree] = useState("");
  const [term, setTerm] = useState("");
  const [completed, setCompleted] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Major-specific course groupings
  const cyberCourses = ["CTIS 370", "CTIS 371", "CTIS 471"];
  const ctisCourses = ["CTIS 342", "CTIS 345", "CTIS 331", "CTIS 322"];

  function annotate(course) {
    if ((degree === "CNS_MAJOR" || degree === "CNS_MINOR") && cyberCourses.includes(course)) {
      return `${course} (Cyber Core)`;
    }
    if ((degree === "CTIS_MAJOR" || degree === "CTIS_MINOR") && ctisCourses.includes(course)) {
      return `${course} (CTIS Core)`;
    }
    return course;
  }

  async function runPlan() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const completedList = completed
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

const data = await getPlan({
 degree, 
    completed: completedList,
  upcomingTerm: term });
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch course plan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Course Planner</h1>

      <Link to="/" style={{ display: "block", marginBottom: "1rem" }}>
        ← Back to Home
      </Link>

      {/* Degree Input */}
      <label>Degree Program</label>
      <select
        value={degree}
        onChange={(e) => setDegree(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem" }}
      >
        <option value="">-- Select Degree --</option>
        <option value="CTIS_MAJOR">CTIS Major</option>
        <option value="CTIS_MINOR">CTIS Minor</option>
        <option value="CNS_MAJOR">Cybersecurity Major</option>
        <option value="CNS_MINOR">Cybersecurity Minor</option>
      </select>

      {/* Term Selector */}
      <label>Upcoming Term</label>
      <select
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem" }}
      >
        <option value="">-- Select Term --</option>
        <option value="Fall">Fall</option>
        <option value="Spring">Spring</option>
      </select>

      {/* Completed Courses Input */}
      <label>Completed Courses (comma separated)</label>
      <input
        type="text"
        placeholder="CTIS 210, CTIS 221"
        value={completed}
        onChange={(e) => setCompleted(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem" }}
      />

      <button onClick={runPlan} disabled={loading}>
        {loading ? "Planning..." : "Generate Plan"}
      </button>

      {/* Error */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Results */}
      {result && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Recommended Plan</h2>

          <p>
            <strong>Upcoming Term:</strong> {result.upcomingTerm}
          </p>

          <h3>Top 4 Recommended Courses</h3>
          <ul>
            {result.recommended_courses?.length > 0 ? (
              result.recommended_courses.map((c) => (
                <li key={c}>{annotate(c)}</li>
              ))
            ) : (
              <li>No recommendations found.</li>
            )}
          </ul>

          <h3>Eligible to Take Now</h3>
          <ul>
            {result.eligible_now?.length > 0 ? (
              result.eligible_now.map((c) => (
                <li key={c}>{annotate(c)}</li>
              ))
            ) : (
              <li>No currently eligible courses found.</li>
            )}
          </ul>

          <p style={{ marginTop: "1rem", fontStyle: "italic", color: "#555" }}>
            Note: Electives, internships, and independent studies are not shown here.  
            Check your Degree Audit for remaining elective or general education requirements.
          </p>
        </div>
      )}
    </div>
  );
}