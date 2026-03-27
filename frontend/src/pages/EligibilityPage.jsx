import { useState, useEffect } from "react";
import { getCourses, getEligibility } from "../api";
import { Link } from "react-router-dom";

export default function EligibilityPage() {
  const [courseId, setCourseId] = useState(""); // <-- stays typed input
  const [completed, setCompleted] = useState([]); // <-- now an array
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dynamic course list
  const [allCourses, setAllCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [errorCourses, setErrorCourses] = useState(null);

  // Load courses on mount
  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await getCourses();
        setAllCourses(data);
      } catch (err) {
        setErrorCourses(err.message);
      } finally {
        setLoadingCourses(false);
      }
    }

    loadCourses();
  }, []);

  // Toggle completed courses
  function toggleCourse(course) {
    setCompleted((prev) =>
      prev.includes(course)
        ? prev.filter((c) => c !== course)
        : [...prev, course]
    );
  }

  async function runEligibility() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await getEligibility(courseId, completed);
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

      {/* Course Input (kept as typed input) */}
      <label>Course ID (e.g., CTIS 310)</label>
      <input
        type="text"
        placeholder="CTIS 310"
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem" }}
      />

      {/* Completed Courses Checklist */}
      <label>Completed Courses</label>

      {loadingCourses && <p>Loading courses…</p>}
      {errorCourses && <p style={{ color: "red" }}>Error: {errorCourses}</p>}

      {!loadingCourses && !errorCourses && (
        <div
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            marginBottom: "1rem",
            maxHeight: "250px",
            overflowY: "auto",
          }}
        >
          {allCourses.map((course) => (
            <label key={course} style={{ display: "block" }}>
              <input
                type="checkbox"
                checked={completed.includes(course)}
                onChange={() => toggleCourse(course)}
              />
              {course}
            </label>
          ))}
        </div>
      )}

      <button onClick={runEligibility} disabled={loading || !courseId}>
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
            <strong>Eligible:</strong> {result.eligible ? "Yes" : "No"}
          </p>

          {/* Missing prerequisites */}
          <h3>Missing Prerequisites</h3>
          <ul>
            {result.missing?.length > 0 ? (
              result.missing.map((m, idx) => {
                if (Array.isArray(m)) {
                  m = m.join(", ");
                } else if (m === null || m === undefined) {
                  return <li key={idx}>Unknown prerequisite</li>;
                } else if (typeof m !== "string") {
                  m = String(m);
                }

                if (m.includes(",")) {
                  const parts = m.split(",").map((p) => p.trim());
                  const formatted = parts
                    .map((p, i) => (i === 0 ? p : `or ${p}`))
                    .join(", ");
                  return <li key={idx}>{formatted}</li>;
                }

                return <li key={idx}>{m}</li>;
              })
            ) : (
              <li>None</li>
            )}
          </ul>

          {/* Explanation */}
          <h3>Explanation</h3>
          <p>{result.explanation}</p>

          {/* Next Courses */}
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