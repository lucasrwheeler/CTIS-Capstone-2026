import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCourses, getDegreeAudit } from "../api";
import PageHeader from "../components/PageHeader";


export default function DegreeAuditPage() {
  const [degree, setDegree] = useState("CTIS_MAJOR");
  const [completed, setCompleted] = useState([]);
  const [internCredits, setInternCredits] = useState({});
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

  const internCourseIds = new Set(
    allCourses
      .filter(c => c.title?.toLowerCase().includes("internship"))
      .map(c => c.course_id)
  );

  function toggleCourse(courseId) {
    setCompleted(prev =>
      prev.includes(courseId)
        ? prev.filter(c => c !== courseId)
        : [...prev, courseId]
    );
  }

  function setInternAmount(courseId, credits) {
    const cr = parseInt(credits, 10);
    setInternCredits(prev => ({ ...prev, [courseId]: cr }));
    if (cr > 0) {
      setCompleted(prev => prev.includes(courseId) ? prev : [...prev, courseId]);
    } else {
      setCompleted(prev => prev.filter(c => c !== courseId));
    }
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

  const normalizedDegree =
    degree === "CYBER_MAJOR" ? "CNS_MAJOR" :
    degree === "CYBER_MINOR" ? "CNS_MINOR" : degree;

  // Only include internship entries where student actually earned credits
  const activeInternCredits = Object.fromEntries(
    Object.entries(internCredits).filter(([, v]) => v > 0)
  );

  const distinctLink =
    `/distinct?programA=${normalizedDegree}` +
    `&completed=${completed.map(c => encodeURIComponent(c)).join(",")}` +
    (Object.keys(activeInternCredits).length > 0
      ? `&internCredits=${encodeURIComponent(JSON.stringify(activeInternCredits))}`
      : "");

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
     

      <Link to="/" style={{ display: "block", marginBottom: "1rem" }}>
        ← Back to Home
      </Link>

      <PageHeader
  icon="🎓"
  title="Degree Audit"
  description="Enter the courses you've completed and the Degree/Program of your choice to see exactly where you stand toward your degree requirements and progress."
/>

      <label>Degree Program</label>
      <select
        value={degree}
        onChange={e => setDegree(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem" }}
      >
        <option value="">-- Select Degree --</option>
        <option value="CTIS_MAJOR">CTIS Major</option>
        <option value="CTIS_MINOR">CTIS Minor</option>
        <option value="CYBER_MAJOR">Cybersecurity Major</option>
        <option value="CYBER_MINOR">Cybersecurity Minor</option>
      </select>

      <label>Completed Courses</label>

      {loadingCourses && <p>Loading courses…</p>}
      {errorCourses && <p style={{ color: "red" }}>Error: {errorCourses}</p>}

      {!loadingCourses && !errorCourses && (
        <div style={{
          border: "1px solid #ccc",
          padding: "1rem",
          marginBottom: "1rem",
          maxHeight: "250px",
          overflowY: "auto",
        }}>
          {allCourses.map(course => {
            const isIntern = internCourseIds.has(course.course_id);
            return isIntern ? (
              <div key={course.course_id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                <span style={{ flex: 1 }}>
                  {course.course_id} — {course.title}
                </span>
                <select
                  value={internCredits[course.course_id] ?? 0}
                  onChange={e => setInternAmount(course.course_id, e.target.value)}
                  style={{ padding: "0.1rem 0.4rem", fontSize: "0.875rem" }}
                >
                  <option value={0}>Not taken</option>
                  <option value={1}>1 credit</option>
                  <option value={2}>2 credits</option>
                  <option value={3}>3 credits</option>
                  <option value={4}>4 credits</option>
                </select>
              </div>
            ) : (
              <label key={course.course_id} style={{ display: "block" }}>
                <input
                  type="checkbox"
                  checked={completed.includes(course.course_id)}
                  onChange={() => toggleCourse(course.course_id)}
                />
                {" "}{course.course_id} — {course.title}
              </label>
            );
          })}
        </div>
      )}

      <button onClick={runAudit} disabled={loading}>
        {loading ? "Running Audit..." : "Run Audit"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Audit Results</h2>
          <p><strong>Degree:</strong> {result.degree}</p>
          <p><strong>Progress:</strong> {(result.progress_percent * 100).toFixed(0)}%</p>

          <h3>Completed Core</h3>
          <ul>
            {result.completed_core?.length
              ? result.completed_core.map(c => <li key={c}>{c}</li>)
              : <li>None</li>}
          </ul>

          <h3>Remaining Core</h3>
          <ul>
            {result.remaining_core?.length
              ? result.remaining_core.map(c => <li key={c}>{c}</li>)
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
              <p>{result.internship_satisfied ? "Completed" : "Not completed"}</p>
            </>
          )}

          <h3>Recommended Next Courses</h3>
          <ul>
            {result.recommended_order?.length
              ? result.recommended_order.map(c => <li key={c}>{c}</li>)
              : <li>No recommendations</li>}
          </ul>

          <h3>Eligible Next Courses</h3>
          <ul>
            {result.eligible_next?.length
              ? result.eligible_next.map(c => <li key={c}>{c}</li>)
              : <li>No eligible courses</li>}
          </ul>

          <h3>Notes</h3>
          <p>{result.notes}</p>

          <div style={{
            marginTop: "2rem",
            paddingTop: "1.25rem",
            borderTop: "2px solid #e2e8f0",
          }}>
            <p style={{ color: "#4a5568", marginBottom: "0.75rem" }}>
              Pursuing a second program? Check whether your course combination
              meets Guilford's distinct credit requirement.
            </p>
            <Link
              to={distinctLink}
              style={{
                display: "inline-block",
                padding: "0.6rem 1.1rem",
                background: "#0a4a8a",
                color: "white",
                borderRadius: 6,
                fontWeight: 600,
                textDecoration: "none",
                fontSize: "0.95rem",
              }}
            >
              Check Distinct Credit Requirement →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}