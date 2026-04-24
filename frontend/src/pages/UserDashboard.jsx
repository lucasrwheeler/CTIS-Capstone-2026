import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSavedCourses } from "../hooks/useSavedCourses";
import { getCourses } from "../api";

const CARD = {
  background: "white", border: "1px solid #e2e8f0",
  borderRadius: 10, padding: "1.5rem",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};

const DEGREE_LABELS = {
  CTIS_MAJOR: "CTIS Major",
  CTIS_MINOR: "CTIS Minor",
  CYBER_MAJOR: "Cybersecurity Major",
  CYBER_MINOR: "Cybersecurity Minor",
};

const PROGRAM_OPTIONS = [
  { value: "CTIS_MAJOR",  label: "CTIS Major",          desc: "B.S. in Computer & Technology Information Systems" },
  { value: "CTIS_MINOR",  label: "CTIS Minor",          desc: "Undergraduate minor in CTIS" },
  { value: "CYBER_MAJOR", label: "Cybersecurity Major", desc: "B.S. in Cybersecurity & Network Security" },
  { value: "CYBER_MINOR", label: "Cybersecurity Minor", desc: "Undergraduate minor in Cybersecurity" },
];

function getEnrollmentLabel(draft) {
  if (draft.length === 0) return null;
  const majorCount = draft.filter(p => p.includes("MAJOR")).length;
  const minorCount = draft.filter(p => p.includes("MINOR")).length;
  if (majorCount === 2 && minorCount === 2) return "Double Major + Double Minor";
  if (majorCount === 2 && minorCount === 1) return "Double Major + Minor";
  if (majorCount === 2) return "Double Major";
  if (majorCount === 1 && minorCount === 2) return "Major + Double Minor";
  if (majorCount === 1 && minorCount === 1) return "Major / Minor";
  if (majorCount === 1) return "Single Major";
  if (minorCount === 2) return "Double Minor";
  if (minorCount === 1) return "Minor Only";
  return null;
}

function ProgramSelector({ programs, setPrograms }) {
  const [draft, setDraft] = useState([...programs]);
  const [saved, setSaved] = useState(false);
  const hasChanges = JSON.stringify([...draft].sort()) !== JSON.stringify([...programs].sort());
  const enrollmentLabel = getEnrollmentLabel(draft);

  function toggleDraft(prog) {
    setDraft(prev => prev.includes(prog) ? prev.filter(p => p !== prog) : [...prev, prog]);
    setSaved(false);
  }

  function handleSave() {
    setPrograms(draft);
    setSaved(true);
    // TODO (Cognito): replace with → await api.post('/user/programs', { programs: draft });
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div style={CARD}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.35rem" }}>
        <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0a2a43" }}>Enrolled Programs</h2>
        {enrollmentLabel && (
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1d4ed8", background: "#dbeafe", padding: "0.25rem 0.75rem", borderRadius: 99, border: "1px solid #bfdbfe" }}>
            {enrollmentLabel}
          </span>
        )}
      </div>
      <p style={{ margin: "0 0 1.25rem", color: "#64748b", fontSize: "0.875rem" }}>
        Select all programs you are pursuing. The first checked is your primary for audit and planning tools.
      </p>

      {PROGRAM_OPTIONS.map((opt, i) => {
        const isChecked = draft.includes(opt.value);
        return (
          <label key={opt.value} style={{
            display: "flex", alignItems: "flex-start", gap: "0.85rem",
            padding: "0.85rem 1rem", marginBottom: i < 3 ? "0.5rem" : 0,
            borderRadius: 8, border: `1.5px solid ${isChecked ? "#bfdbfe" : "#e2e8f0"}`,
            background: isChecked ? "#f0f7ff" : "white", cursor: "pointer",
          }}>
            <input type="checkbox" checked={isChecked} onChange={() => toggleDraft(opt.value)}
              style={{ width: 16, height: 16, marginTop: 2, accentColor: "#1d4ed8", cursor: "pointer" }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600, color: "#0a2a43", fontSize: "0.9rem" }}>{opt.label}</span>
              <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.15rem" }}>{opt.desc}</div>
            </div>
          </label>
        );
      })}

      <div style={{ marginTop: "1.1rem", display: "flex", alignItems: "center", gap: "0.85rem", flexWrap: "wrap" }}>
        <button onClick={handleSave} disabled={!hasChanges} style={{
          padding: "0.6rem 1.4rem", borderRadius: 7, fontWeight: 700, fontSize: "0.9rem",
          background: hasChanges ? "#0a2a43" : "#e2e8f0",
          color: hasChanges ? "white" : "#94a3b8",
          border: "none", cursor: hasChanges ? "pointer" : "not-allowed",
        }}>
          Save Programs
        </button>
        {saved && <span style={{ fontSize: "0.85rem", color: "#059669", fontWeight: 600 }}>✓ Saved!</span>}
        {hasChanges && !saved && <span style={{ fontSize: "0.8rem", color: "#92400e" }}>Unsaved changes</span>}
      </div>

      {draft.length > 1 && (
        <p style={{ margin: "0.85rem 0 0", fontSize: "0.78rem", color: "#64748b", fontStyle: "italic" }}>
          💡 Use the Distinct Credits Calculator to verify your combination meets Guilford's 18-credit requirement.
        </p>
      )}
    </div>
  );
}

export default function UserDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { completed, degree, programs, setPrograms, removeCourse, clearAll } = useSavedCourses();
  const [allCourses, setAllCourses] = useState([]);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    getCourses().then(setAllCourses).catch(() => {});
  }, []);

  if (!currentUser) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>You are not signed in. <Link to="/login">Sign in</Link></p>
      </div>
    );
  }

  const roleLabel = { professor: "Professor", student: "Student", alumni: "Alumni" }[currentUser.role] || currentUser.role;
  const roleColors = currentUser.role === "professor"
    ? { bg: "#e0f2fe", color: "#0369a1", border: "#bae6fd" }
    : currentUser.role === "alumni"
    ? { bg: "#fef9c3", color: "#92400e", border: "#fde68a" }
    : { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" };

  const savedCourseDetails = allCourses.filter(c => completed.includes(c.course_id));
  const totalCredits = savedCourseDetails.reduce((sum, c) => sum + (parseInt(c.credits) || 0), 0);
  const enrollmentLabel = getEnrollmentLabel(programs);

  function handleLogout() { logout(); navigate("/"); }

  function handleClear() {
    if (confirmClear) { clearAll(); setConfirmClear(false); }
    else setConfirmClear(true);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0a1f35 0%, #0a3a6b 100%)", color: "white", padding: "2.5rem 2rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontSize: "2.25rem", marginBottom: "0.5rem" }}>👤</div>
          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700 }}>My Account</h1>
          <p style={{ margin: "0.5rem 0 0", color: "#93c5fd", fontSize: "1rem" }}>
            Manage your profile, enrolled programs, and course history.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        {/* Identity card */}
        <div style={CARD}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <p style={{ margin: "0 0 0.25rem", fontSize: "0.78rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Signed in as
              </p>
              <p style={{ margin: "0 0 0.5rem", fontSize: "1.05rem", fontWeight: 600, color: "#0a2a43" }}>
                {currentUser.email}
              </p>
              <span style={{
                display: "inline-block", fontSize: "0.78rem", fontWeight: 600,
                padding: "0.25rem 0.65rem", borderRadius: 12,
                background: roleColors.bg, color: roleColors.color, border: `1px solid ${roleColors.border}`,
              }}>
                {roleLabel}
              </span>
            </div>
            <button onClick={handleLogout} style={{
              padding: "0.5rem 1rem", borderRadius: 7,
              background: "#fee2e2", color: "#dc2626",
              border: "1px solid #fecaca", cursor: "pointer",
              fontSize: "0.875rem", fontWeight: 600,
            }}>
              Sign Out
            </button>
          </div>

          {/* Professor profile links */}
          {currentUser.role === "professor" && currentUser.professor_name && (
            <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid #e2e8f0" }}>
              <p style={{ margin: "0 0 0.75rem", fontSize: "0.78rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Your Profile
              </p>
              <p style={{ margin: "0 0 0.85rem", color: "#334155", fontWeight: 500 }}>{currentUser.professor_name}</p>
              <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
                <Link to={`/professors/${encodeURIComponent(currentUser.professor_name)}`} style={{
                  padding: "0.45rem 1rem", background: "#0a2a43", color: "white",
                  textDecoration: "none", borderRadius: 7, fontSize: "0.85rem", fontWeight: 600,
                }}>
                  View Profile
                </Link>
                <Link to={`/professors/${encodeURIComponent(currentUser.professor_name)}/edit`} style={{
                  padding: "0.45rem 1rem", background: "#f0f4ff", color: "#0a4a8a",
                  border: "1px solid #c7d7f5", textDecoration: "none",
                  borderRadius: 7, fontSize: "0.85rem", fontWeight: 600,
                }}>
                  Edit Profile
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Student / alumni sections */}
        {currentUser.role !== "professor" && (
          <>
            {/* Summary stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
              <div style={{ ...CARD, background: "#f0f7ff", border: "1px solid #bfdbfe", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0a2a43" }}>{completed.length}</div>
                <div style={{ fontSize: "0.8rem", color: "#1e40af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Courses Saved</div>
              </div>
              <div style={{ ...CARD, background: "#f0fdf4", border: "1px solid #86efac", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#065f46" }}>{totalCredits}</div>
                <div style={{ fontSize: "0.8rem", color: "#059669", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Credits</div>
              </div>
              <div style={{ ...CARD, background: "#faf5ff", border: "1px solid #d8b4fe", textAlign: "center" }}>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "#5b21b6" }}>
                  {enrollmentLabel || (degree ? DEGREE_LABELS[degree] : "—")}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#7c3aed", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Enrollment</div>
              </div>
            </div>

            {/* Program selector */}
            <ProgramSelector programs={programs} setPrograms={setPrograms} />

            {/* Course history */}
            <div style={{ ...CARD, padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0a2a43" }}>Saved Course History</h2>
                  <p style={{ margin: "0.2rem 0 0", color: "#64748b", fontSize: "0.8rem" }}>
                    Auto-populates on Degree Audit, Course Planner, and Eligibility pages.
                  </p>
                </div>
                {completed.length > 0 && (
                  <button onClick={handleClear} style={{
                    padding: "0.4rem 0.85rem", borderRadius: 6,
                    border: `1px solid ${confirmClear ? "#fca5a5" : "#e2e8f0"}`,
                    background: confirmClear ? "#fef2f2" : "white",
                    color: confirmClear ? "#dc2626" : "#64748b",
                    fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                  }}>
                    {confirmClear ? "⚠️ Click again to confirm clear all" : "Clear All"}
                  </button>
                )}
              </div>

              {completed.length === 0 ? (
                <div style={{ padding: "2.5rem", textAlign: "center", color: "#94a3b8" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📋</div>
                  <p style={{ margin: "0 0 1rem", fontWeight: 600 }}>No courses saved yet</p>
                  <p style={{ margin: "0 0 1.25rem", fontSize: "0.875rem" }}>
                    Check off courses on the Degree Audit or Course Planner — they'll appear here automatically.
                  </p>
                  <Link to="/degree-audit" style={{
                    display: "inline-block", padding: "0.6rem 1.25rem",
                    background: "#0a2a43", color: "white", borderRadius: 7,
                    textDecoration: "none", fontWeight: 600, fontSize: "0.875rem",
                  }}>
                    Go to Degree Audit →
                  </Link>
                </div>
              ) : (
                <>
                  <div style={{ maxHeight: 420, overflowY: "auto" }}>
                    {savedCourseDetails.length > 0 ? savedCourseDetails.map(course => (
                      <div key={course.course_id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 600, color: "#0a2a43", fontSize: "0.875rem" }}>{course.course_id}</span>
                          <span style={{ color: "#64748b", fontSize: "0.875rem" }}> — {course.title}</span>
                        </div>
                        <span style={{ color: "#94a3b8", fontSize: "0.8rem", minWidth: 36 }}>{course.credits} cr</span>
                        <button onClick={() => removeCourse(course.course_id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "1rem", padding: "0.1rem 0.3rem" }} title="Remove">✕</button>
                      </div>
                    )) : completed.map(courseId => (
                      <div key={courseId} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ flex: 1, fontWeight: 600, color: "#0a2a43", fontSize: "0.875rem" }}>{courseId}</span>
                        <button onClick={() => removeCourse(courseId)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "1rem" }}>✕</button>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    <Link to="/degree-audit" style={{ padding: "0.55rem 1rem", background: "#0a2a43", color: "white", borderRadius: 7, textDecoration: "none", fontWeight: 600, fontSize: "0.85rem" }}>
                      Run Degree Audit →
                    </Link>
                    <Link to="/planner" style={{ padding: "0.55rem 1rem", background: "white", color: "#0a2a43", border: "1px solid #e2e8f0", borderRadius: 7, textDecoration: "none", fontWeight: 600, fontSize: "0.85rem" }}>
                      Open Course Planner →
                    </Link>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}