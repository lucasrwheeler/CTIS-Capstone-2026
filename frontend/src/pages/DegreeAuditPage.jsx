import { useState } from "react";
import { getDegreeAudit } from "../api";
import { Link } from "react-router-dom";

export default function DegreeAuditPage() {
  const [degree, setDegree] = useState("CTIS_MAJOR");
  const [completed, setCompleted] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function runAudit() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const completedList = completed
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const data = await getDegreeAudit(degree, completedList);
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



      {/* Completed Courses Input */}
      <label>Completed Courses (comma separated)</label>
      <input
        type="text"
        placeholder="CTIS 210, CTIS 221, MATH 110"
        value={completed}
        onChange={(e) => setCompleted(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem" }}
      />

      

      <button onClick={runAudit} disabled={loading}>
        {loading ? "Running Audit..." : "Run Audit"}
      </button>

      {/* Error */}
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

          {/* Completed Core */}
          <h3>Completed Core</h3>
          <ul>
            {result.completed_core?.map((c) => (
              <li key={c}>{c}</li>
            )) || <li>None</li>}
          </ul>

          {/* Remaining Core */}
          <h3>Remaining Core</h3>
          <ul>
            {result.remaining_core?.map((c) => (
              <li key={c}>{c}</li>
            )) || <li>None</li>}
          </ul>

          {/* Elective Status */}
          <h3>Elective Status</h3>
          <p>{result.elective_satisfied ? "Satisfied" : "Not satisfied"}</p>

          {/* Internship */}
          <h3>Internship</h3>
          <p>{result.internship_satisfied ? "Completed" : "Not completed"}</p>

          {/* Recommended Order */}
          <h3>Recommended Next Courses</h3>
          <ul>
            {result.recommended_order?.map((c) => (
              <li key={c}>{c}</li>
            )) || <li>No recommendations</li>}
          </ul>

          {/* Eligible Next */}
          <h3>Eligible Next Courses</h3>
          <ul>
            {result.eligible_next?.map((c) => (
              <li key={c}>{c}</li>
            )) || <li>No eligible courses</li>}
          </ul>

          {/* Notes */}
          <h3>Notes</h3>
          <p>{result.notes}</p>
        </div>
      )}
    </div>
  );
}