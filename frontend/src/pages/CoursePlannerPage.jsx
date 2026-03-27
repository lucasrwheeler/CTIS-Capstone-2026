import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCourses, getPlan } from "../api";

export default function CoursePlannerPage() {
  const [degree, setDegree] = useState("");
  const [term, setTerm] = useState("");
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

  // Major-specific annotation
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
      const data = await getPlan({
        degree,
        completed,
        upcomingTerm: term
      });

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