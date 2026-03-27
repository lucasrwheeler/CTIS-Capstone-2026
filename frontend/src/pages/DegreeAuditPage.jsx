import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCourses, getDegreeAudit } from "../api";

export default function DegreeAuditPage() {
  const [degree, setDegree] = useState("CTIS_MAJOR");
  const [completed, setCompleted] = useState([]);
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

  // Toggle a course in/out of completed list
  function toggleCourse(course) {
    setCompleted((prev) =>
      prev.includes(course)
        ? prev.filter((c) => c !== course)
        : [...prev, course]
    );
  }

  async function runAudit() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await getDegreeAudit(degree, completed);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch audit.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Degree Audit</h1>

      <Link to="/" style={{ display: "block", marginBottom: "1rem" }}>
        ← Back to Home
      </Link>

      {/* Degree Selector */}
      <label>Degree Program</label>
      <select
        value={degree}
        onChange={(e) => setDegree(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem" }}
      >
        <option value="">-- Select Degree --</option>
        <option value="CTIS_MAJOR">CTIS Major</option>
        <option value="CTIS_MINOR">CTIS Minor</option>
        <option value="CYBER_MAJOR">Cybersecurity Major</option>
        <option value="CYBER_MINOR">Cybersecurity Minor</option>
      </select>

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

      <button onClick={runAudit} disabled={loading}>
        {loading ? "Running Audit..." : "Run Audit"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Results */}
      {result && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Audit Results</h2>

          <p>
            <strong>Degree:</strong> {result.degree}
          </p>

          <p>
            <strong>Progress:</strong>{" "}
            {(result.progress_percent * 100).toFixed(0)}%
          </p>

          <h3>Completed Core</h3>
          <ul>
            {result.completed_core?.length
              ? result.completed_core.map((c) => <li key={c}>{c}</li>)
              : <li>None</li>}
          </ul>

          <h3>Remaining Core</h3>
          <ul>
            {result.remaining_core?.length
              ? result.remaining_core.map((c) => <li key={c}>{c}</li>)
              : <li>None</li>}
          </ul>

          <h3>Elective Status</h3>
          <p>{result.elective_satisfied ? "Satisfied" : "Not satisfied"}</p>

          {result.completed_electives?.length > 0 && (
            <p>
              <strong>Completed electives:</strong>{" "}
              {result.completed_electives.join(", ")}
            </p>
          )}

          <p>
            <strong>Remaining elective slots:</strong>{" "}
            {result.remaining_requirements.elective_slots_remaining}
          </p>

          {(degree === "CTIS_MAJOR" || degree === "CNS_MAJOR") && (
            <>
              <h3>Internship</h3>
              <p>
                {result.internship_satisfied
                  ? "Completed"
                  : "Not completed"}
              </p>
            </>
          )}

          <h3>Recommended Next Courses</h3>
          <ul>
            {result.recommended_order?.length
              ? result.recommended_order.map((c) => <li key={c}>{c}</li>)
              : <li>No recommendations</li>}
          </ul>

          <h3>Eligible Next Courses</h3>
          <ul>
            {result.eligible_next?.length
              ? result.eligible_next.map((c) => <li key={c}>{c}</li>)
              : <li>No eligible courses</li>}
          </ul>

          <h3>Notes</h3>
          <p>{result.notes}</p>
        </div>
      )}
    </div>
  );
}