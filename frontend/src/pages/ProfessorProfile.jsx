import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProfessors } from "../api";

export default function ProfessorProfile() {
  const { name } = useParams();
  const [professor, setProfessor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const all = await getProfessors();
        const decodedName = decodeURIComponent(name);
        const match = all.find(
          (p) => p.name.toLowerCase() === decodedName.toLowerCase()
        );
        if (!match) {
          setError(true);
        } else {
          setProfessor(match);
        }
      } catch (err) {
        console.error("Failed to load professor:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [name]);

  if (loading) return <div className="page-container">Loading professor…</div>;
  if (error || !professor) return (
    <div className="page-container">
      <p>Professor not found.</p>
      <Link to="/professors">← Back to Professors</Link>
    </div>
  );

  return (
    <div className="page-container">
      <Link to="/professors" style={{ color: "#0a4a8a", textDecoration: "none", fontSize: "0.9rem" }}>
        ← Back to Professors
      </Link>

      <div style={{ marginTop: "1.5rem", marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "2px solid #e2e8f0" }}>
        <h1 className="page-title" style={{ marginBottom: "0.25rem" }}>
          {professor.name}
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#4a5568", margin: 0 }}>
          {professor.role} &mdash; {professor.department}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        <div className="professor-card" style={{ margin: 0 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0a2a43", marginBottom: "0.5rem" }}>
            Department
          </h2>
          <p style={{ margin: 0, color: "#4a5568" }}>{professor.department}</p>
        </div>

        <div className="professor-card" style={{ margin: 0 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0a2a43", marginBottom: "0.5rem" }}>
            Position
          </h2>
          <p style={{ margin: 0, color: "#4a5568" }}>{professor.role}</p>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0a2a43", marginBottom: "1rem" }}>
          Courses Taught
        </h2>

        {!professor.courses || professor.courses.length === 0 ? (
          <p style={{ color: "#718096" }}>No courses currently assigned.</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {professor.courses.map((courseId) => (
              <Link
                key={courseId}
                to={`/courses?open=${encodeURIComponent(courseId)}`}
                style={{
                  display: "inline-block",
                  padding: "0.4rem 0.9rem",
                  background: "#ebf4ff",
                  color: "#0a4a8a",
                  borderRadius: "6px",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  textDecoration: "none",
                  border: "1px solid #bee3f8",
                }}
              >
                {courseId}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}