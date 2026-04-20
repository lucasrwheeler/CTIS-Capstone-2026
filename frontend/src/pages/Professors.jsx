import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProfessors } from "../api";

function ProfessorCard({ professor, faded }) {
  const courseCount = professor.courses?.length ?? 0;

  return (
    <Link
      to={`/professors/${encodeURIComponent(professor.name)}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <div
        className="professor-card"
        style={{
          opacity: faded ? 0.75 : 1,
          borderLeft: faded ? "4px solid #cbd5e1" : "4px solid #0a4a8a",
          cursor: "pointer",
          transition: "box-shadow 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(10,74,138,0.10)"}
        onMouseLeave={e => e.currentTarget.style.boxShadow = ""}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h3 style={{ margin: 0, color: "#0a2a43", fontSize: "1.05rem" }}>{professor.name}</h3>
            {professor.role && (
              <p style={{ margin: "0.15rem 0 0", fontSize: "0.82rem", color: "#718096" }}>
                {professor.role}{professor.department ? ` · ${professor.department}` : ""}
              </p>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{
              fontSize: "0.78rem",
              fontWeight: 600,
              padding: "0.2rem 0.55rem",
              borderRadius: 12,
              background: courseCount > 0 ? "#eff6ff" : "#f1f5f9",
              color: courseCount > 0 ? "#1e40af" : "#94a3b8",
              border: `1px solid ${courseCount > 0 ? "#bfdbfe" : "#e2e8f0"}`,
              whiteSpace: "nowrap",
            }}>
              {courseCount === 0 ? "No current courses" : `${courseCount} course${courseCount !== 1 ? "s" : ""}`}
            </span>
            <span style={{ color: "#94a3b8", fontSize: "1rem" }}>›</span>
          </div>
        </div>

        {courseCount > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.6rem" }}>
            {professor.courses.map(courseId => (
              <span
                key={courseId}
                style={{
                  padding: "0.25rem 0.65rem",
                  borderRadius: 5,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  background: "#f0f4ff",
                  color: "#0a4a8a",
                  border: "1px solid #c7d7f5",
                }}
              >
                {courseId}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function Professors() {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProfessors();
        setProfessors(data || []);
      } catch (err) {
        console.error("Failed to load professors:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="page-container">Loading professors…</div>;

  const active = professors.filter(p => p.name !== "Varies" && (p.courses?.length ?? 0) > 0);
  const past   = professors.filter(p => p.name === "Varies" || (p.courses?.length ?? 0) === 0);

  return (
    <div className="page-container">
      <h1 className="page-title">Professors Directory</h1>

      <p style={{ color: "#4a5568", marginBottom: "1.5rem" }}>
        {active.length} faculty member{active.length !== 1 ? "s" : ""} currently teaching in the CTIS/CNS department.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "3rem" }}>
        {active.map(p => (
          <ProfessorCard key={p.name} professor={p} faded={false} />
        ))}
      </div>

      {past.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <h2 style={{ margin: 0, color: "#64748b", fontSize: "1.05rem", fontWeight: 700 }}>
              Past &amp; Varies Instructors
            </h2>
            <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
          </div>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
            Instructors who have taught department courses but are no longer actively assigned, or courses listed as "Varies."
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {past.map(p => (
              <ProfessorCard key={p.name} professor={p} faded={true} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}