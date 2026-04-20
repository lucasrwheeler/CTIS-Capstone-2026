import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getProfessors, getProfessorProfile } from "../api";
import { useAuth } from "../context/AuthContext";

export default function ProfessorProfile() {
  const { name: nameParam } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(nameParam || "");
  const { currentUser } = useAuth();

  const [professor, setProfessor] = useState(null);
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [allProfs, prof] = await Promise.all([
          getProfessors(),
          getProfessorProfile(name)
        ]);
        const found = (allProfs || []).find(p => p.name === name);
        if (!found) { setError("Professor not found."); return; }
        setProfessor(found);
        setProfile(prof || {});
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [name]);

  const courseCount = professor?.courses?.length ?? 0;
  const isVaries    = professor?.name === "Varies";
  const isPast      = isVaries || courseCount === 0;
  const hasProfile  = profile && (
    profile.bio || profile.email || profile.office ||
    profile.office_hours || profile.website || profile.research_interests
  );

  // Only the matching logged-in professor sees the edit button
  const canEdit = currentUser?.role === "professor" &&
                  currentUser?.professor_name === name &&
                  !isVaries;

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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
              <div>
                <h1 style={{ margin: 0, color: "#0a2a43", fontSize: "1.5rem" }}>{professor.name}</h1>
                {professor.role && (
                  <p style={{ margin: "0.25rem 0 0", color: "#718096", fontSize: "0.9rem" }}>
                    {professor.role}{professor.department ? ` · ${professor.department}` : ""}
                  </p>
                )}
                {profile?.email && (
                  <p style={{ margin: "0.35rem 0 0", fontSize: "0.875rem", color: "#475569" }}>
                    ✉{" "}
                    <a href={`mailto:${profile.email}`} style={{ color: "#0a4a8a", textDecoration: "none" }}>
                      {profile.email}
                    </a>
                  </p>
                )}
                {profile?.office && (
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.875rem", color: "#475569" }}>
                    📍 {profile.office}
                  </p>
                )}
                {profile?.website && (
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.875rem" }}>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer"
                       style={{ color: "#0a4a8a", textDecoration: "none" }}>
                      🔗 Website
                    </a>
                  </p>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                {isPast && (
                  <span style={{
                    fontSize: "0.78rem", fontWeight: 600, padding: "0.25rem 0.65rem",
                    borderRadius: 12, background: "#f1f5f9", color: "#94a3b8", border: "1px solid #e2e8f0"
                  }}>
                    Past / Varies
                  </span>
                )}
                {canEdit && (
                  <Link
                    to={`/professors/${encodeURIComponent(professor.name)}/edit`}
                    style={{
                      padding: "0.4rem 0.9rem", borderRadius: 6,
                      background: "#f0f4ff", color: "#0a4a8a",
                      border: "1px solid #c7d7f5", textDecoration: "none",
                      fontSize: "0.85rem", fontWeight: 600
                    }}
                  >
                    ✏ Edit Profile
                  </Link>
                )}
              </div>
            </div>

            {profile?.office_hours && (
              <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9" }}>
                <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Office Hours
                </p>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.9rem", color: "#334155", whiteSpace: "pre-wrap" }}>
                  {profile.office_hours}
                </p>
              </div>
            )}
          </div>

          {profile?.bio && (
            <div className="professor-card" style={{ marginBottom: "1.5rem" }}>
              <p style={{ margin: "0 0 0.4rem", fontSize: "0.82rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>About</p>
              <p style={{ margin: 0, color: "#334155", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{profile.bio}</p>
            </div>
          )}

          {profile?.research_interests && (
            <div className="professor-card" style={{ marginBottom: "1.5rem" }}>
              <p style={{ margin: "0 0 0.4rem", fontSize: "0.82rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Research Interests</p>
              <p style={{ margin: 0, color: "#334155", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{profile.research_interests}</p>
            </div>
          )}

          {!hasProfile && canEdit && (
            <div style={{
              padding: "1rem 1.25rem", background: "#f8fafc",
              border: "1px dashed #cbd5e1", borderRadius: 8, marginBottom: "1.5rem",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexWrap: "wrap", gap: "0.75rem"
            }}>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>No profile details added yet.</p>
              <Link
                to={`/professors/${encodeURIComponent(professor.name)}/edit`}
                style={{
                  padding: "0.4rem 0.9rem", borderRadius: 6,
                  background: "#0a4a8a", color: "white",
                  textDecoration: "none", fontSize: "0.85rem", fontWeight: 600
                }}
              >
                Add Profile Info
              </Link>
            </div>
          )}

          <h2 style={{ color: "#0a2a43", fontSize: "1.1rem", marginBottom: "0.75rem" }}>
            {isVaries ? "Courses Listed as Varies" : "Courses Taught"}
          </h2>

          {courseCount === 0 ? (
            <p style={{ color: "#94a3b8", fontStyle: "italic" }}>No courses currently assigned.</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
              {professor.courses.map(courseId => (
                <Link key={courseId} to={`/courses?open=${encodeURIComponent(courseId)}`}
                  style={{
                    padding: "0.4rem 0.9rem", borderRadius: 6,
                    fontSize: "0.9rem", fontWeight: 600,
                    background: "#f0f4ff", color: "#0a4a8a",
                    border: "1px solid #c7d7f5", textDecoration: "none"
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