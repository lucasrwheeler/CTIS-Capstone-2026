import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getProfessors } from "../api";

export default function ProfessorProfile() {
  const { name: nameParam } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(nameParam || "");

  const [professor, setProfessor] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    getProfessors()
      .then(data => {
        const found = (data || []).find(p => p.name === name);
        if (!found) setError("Professor not found.");
        else setProfessor(found);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [name]);

  const courseCount = professor?.courses?.length ?? 0;
  const isVaries    = professor?.name === "Varies";
  const isPast      = isVaries || courseCount === 0;

  return (
    <div className="page-container">
      <Link to="/professors" style={{ color: "#0a4a8a", textDecoration: "none", fontSize: "0.9rem" }}>
        ← Back to Professors
      </Link>

      {loading && <p style={{ color: "#718096", marginTop: "2rem" }}>Loading…</p>}

      {error && (
        <div style={{ marginTop: "2rem" }}>
          <p style={{ color: "red" }}>{error}</p>
          <button onClick={() => navigate("/professors")} style={{ marginTop: "0.5rem" }}>
            Back to Professors
          </button>
        </div>
      )}

      {professor && (
        <div style={{ marginTop: "1.5rem" }}>
          <div className="professor-card" style={{
            borderLeft: isPast ? "4px solid #cbd5e1" : "4px solid #0a4a8a",
            marginBottom: "1.5rem",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
              <div>
                <h1 style={{ margin: 0, color: "#0a2a43", fontSize: "1.5rem" }}>{professor.name}</h1>
                {professor.role && (
                  <p style={{ margin: "0.25rem 0 0", color: "#718096", fontSize: "0.9rem" }}>
                    {professor.role}{professor.department ? ` · ${professor.department}` : ""}
                  </p>
                )}
              </div>
              {isPast && (
                <span style={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  padding: "0.25rem 0.65rem",
                  borderRadius: 12,
                  background: "#f1f5f9",
                  color: "#94a3b8",
                  border: "1px solid #e2e8f0",
                }}>
                  Past / Varies
                </span>
              )}
            </div>
          </div>

          <h2 style={{ color: "#0a2a43", fontSize: "1.1rem", marginBottom: "0.75rem" }}>
            {isVaries ? "Courses Listed as Varies" : "Courses Taught"}
          </h2>

          {courseCount === 0 ? (
            <p style={{ color: "#94a3b8", fontStyle: "italic" }}>No courses currently assigned.</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
              {professor.courses.map(courseId => (
                <Link
                  key={courseId}
                  to={`/courses?open=${encodeURIComponent(courseId)}`}
                  style={{
                    padding: "0.4rem 0.9rem",
                    borderRadius: 6,
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    background: "#f0f4ff",
                    color: "#0a4a8a",
                    border: "1px solid #c7d7f5",
                    textDecoration: "none",
                  }}
                >
                  {courseId}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}