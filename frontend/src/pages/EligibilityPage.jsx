import { useState, useEffect } from "react";
import { getCourses, getEligibility } from "../api";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";

export default function EligibilityPage() {
  const [courseId, setCourseId] = useState("");
  const [completed, setCompleted] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [allCourses, setAllCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [errorCourses, setErrorCourses] = useState(null);

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

  function toggleCourse(courseId) {
    setCompleted((prev) =>
      prev.includes(courseId)
        ? prev.filter((c) => c !== courseId)
        : [...prev, courseId]
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


      <Link to="/" style={{ display: "block", marginBottom: "1rem" }}>
        ← Back to Home
      </Link>

      <PageHeader
  icon="✅"
  title="Course Eligibility"
  description="To find out if your are elgibile for a spcefic course, Enter the courses you've completed to determing the correct prerequisities/requirements to take the course."
/>

      <label>Course ID (e.g., CTIS 310)</label>
      <input
        type="text"
        placeholder="CTIS 310"
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem" }}
      />

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
            <label key={course.course_id} style={{ display: "block" }}>
              <input
                type="checkbox"
                checked={completed.includes(course.course_id)}
                onChange={() => toggleCourse(course.course_id)}
              />
              {course.course_id} — {course.title}
            </label>
          ))}
        </div>
      )}

      <button onClick={runEligibility} disabled={loading || !courseId}>
        {loading ? "Checking..." : "Check Eligibility"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Eligibility Results</h2>

          <p>
            <strong>Course:</strong> {result.course_id}
          </p>

          <p>
            <strong>Eligible:</strong> {result.eligible ? "Yes" : "No"}
          </p>

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

          <h3>Explanation</h3>
          <p>{result.explanation}</p>

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