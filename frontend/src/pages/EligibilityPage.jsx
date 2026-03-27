import { useState } from "react";
import { getEligibility } from "../api";
import { Link } from "react-router-dom";

export default function EligibilityPage() {
  const [courseId, setCourseId] = useState("");
  const [completed, setCompleted] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function runEligibility() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const completedList = completed
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const data = await getEligibility(courseId, completedList);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch eligibility.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Course Eligibility Checker</h1>

      <Link to="/" style={{ display: "block", marginBottom: "1rem" }}>
        ← Back to Home
      </Link>

      {/* Course Input */}
      <label>Course ID (e.g., CTIS 310)</label>
      <input
        type="text"
        placeholder="CTIS 310"
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem" }}
      />

      {/* Completed Courses Input */}
      <label>Completed Courses (comma separated)</label>
      <input
        type="text"
        placeholder="CTIS 210, CTIS 221"
        value={completed}
        onChange={(e) => setCompleted(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem" }}
      />

      <button onClick={runEligibility} disabled={loading}>
        {loading ? "Checking..." : "Check Eligibility"}
      </button>

      {/* Error */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Results */}
      {result && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Eligibility Results</h2>

          <p>
            <strong>Course:</strong> {result.course_id}
          </p>

          <p>
            <strong>Eligible:</strong>{" "}
            {result.eligible ? "Yes" : "No"}
          </p>

          {/* Missing prerequisites */}
          <h3>Missing Prerequisites</h3>
       <ul>
  {result.missing?.length > 0 ? (
    result.missing.map((m, idx) => {
      // Normalize the value into a string
      if (Array.isArray(m)) {
        m = m.join(", ");
      } else if (m === null || m === undefined) {
        return <li key={idx}>Unknown prerequisite</li>;
      } else if (typeof m !== "string") {
        m = String(m);
      }

      // If the string contains commas, treat it as a multi-item group
      if (m.includes(",")) {
        const parts = m.split(",").map((p) => p.trim());

        // Format: A, OR B, OR C, OR D
        const formatted = parts.map((p, i) =>
          i === 0 ? p : `or ${p}`
        ).join(", ");

        return <li key={idx}>{formatted}</li>;
      }

      // Single prerequisite → return as-is
      return <li key={idx}>{m}</li>;
    })
  ) : (
    <li>None</li>
  )}
</ul>

          {/* Explanation */}
          <h3>Explanation</h3>
          <p>{result.explanation}</p>

          {/* Next Courses (if provided) */}
          {result.next_courses && (
            <>
              <h3>Next Courses</h3>
              <ul>
                {result.next_courses.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}