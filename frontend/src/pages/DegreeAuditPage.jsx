import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCourses, getDegreeAudit } from "../api";
import { useSavedCourses } from "../hooks/useSavedCourses";


const CARD = {
  background: "white", border: "1px solid #e2e8f0",
  borderRadius: 10, padding: "1.5rem",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};

const BADGE = (color) => ({
  display: "inline-block", padding: "0.2rem 0.55rem",
  borderRadius: 5, fontSize: "0.8rem", fontWeight: 600,
  background: color === "green" ? "#d1fae5" : color === "red" ? "#fee2e2" : "#f1f5f9",
  color: color === "green" ? "#065f46" : color === "red" ? "#991b1b" : "#334155",
  margin: "0.2rem",
});

export default function DegreeAuditPage() {
const { completed, degree, setDegree, toggleCourse, setInternAmount, internCredits } = useSavedCourses();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const [allCourses, setAllCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [errorCourses, setErrorCourses] = useState(null);

  useEffect(() => {
    getCourses()
      .then(setAllCourses)
      .catch(err => setErrorCourses(err.message))
      .finally(() => setLoadingCourses(false));
  }, []);

  const internCourseIds = new Set(
    allCourses.filter(c => c.title?.toLowerCase().includes("internship")).map(c => c.course_id)
  );

  const filteredCourses = allCourses.filter(c =>
    c.course_id.toLowerCase().includes(search.toLowerCase()) ||
    c.title?.toLowerCase().includes(search.toLowerCase())
  );



  async function runAudit() {
    setLoading(true); setError(null); setResult(null);
    try { setResult(await getDegreeAudit(degree, completed)); }
    catch { setError("Failed to fetch audit. Check your connection and try again."); }
    finally { setLoading(false); }
  }

  const normalizedDegree = degree === "CYBER_MAJOR" ? "CNS_MAJOR" : degree === "CYBER_MINOR" ? "CNS_MINOR" : degree;
  const activeInternCredits = Object.fromEntries(Object.entries(internCredits).filter(([, v]) => v > 0));
  const distinctLink = `/distinct?programA=${normalizedDegree}&completed=${completed.map(c => encodeURIComponent(c)).join(",")}` +
    (Object.keys(activeInternCredits).length > 0 ? `&internCredits=${encodeURIComponent(JSON.stringify(activeInternCredits))}` : "");

  const progressPct = result ? Math.round(result.progress_percent * 100) : 0;

  return (
    <div>
      {/* Page header */}
      <div style={{ background: "linear-gradient(135deg, #0a1f35 0%, #0a3a6b 100%)", color: "white", padding: "2.5rem 2rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontSize: "2.25rem", marginBottom: "0.5rem" }}>🎓</div>
          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700 }}>Degree Audit</h1>
          <p style={{ margin: "0.5rem 0 0", color: "#93c5fd", fontSize: "1rem" }}>
            Select your program and check off completed courses to see your degree progress instantly.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
          {/* Degree selector */}
          <div style={CARD}>
            <label style={{ display: "block", fontWeight: 600, color: "#0a2a43", marginBottom: "0.5rem", fontSize: "0.875rem" }}>
              Degree Program
            </label>
            <select value={degree} onChange={e => setDegree(e.target.value)} style={{
              width: "100%", padding: "0.65rem 0.75rem", borderRadius: 7,
              border: "1.5px solid #e2e8f0", fontSize: "0.95rem", background: "white",
              color: "#0a2a43", cursor: "pointer",
            }}>
              <option value="">— Select Program —</option>
              <option value="CTIS_MAJOR">CTIS Major</option>
              <option value="CTIS_MINOR">CTIS Minor</option>
              <option value="CYBER_MAJOR">Cybersecurity Major</option>
              <option value="CYBER_MINOR">Cybersecurity Minor</option>
            </select>
          </div>

          {/* Summary card */}
          <div style={{ ...CARD, background: "#f0f7ff", border: "1px solid #bfdbfe", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: "0.8rem", color: "#1e40af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>
              Courses Selected
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0a2a43" }}>{completed.length}</div>
            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem" }}>of {allCourses.length} total courses</div>
          </div>
        </div>

        {/* Course checklist */}
        <div style={{ ...CARD, marginBottom: "1.25rem", padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1rem" }}>📋</span>
            <span style={{ fontWeight: 600, color: "#0a2a43", fontSize: "0.9rem" }}>Completed Courses</span>
            <input
              type="text" placeholder="Search courses..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ marginLeft: "auto", padding: "0.35rem 0.65rem", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: "0.85rem", width: 180, outline: "none" }}
            />
          </div>

          {loadingCourses && <p style={{ padding: "1rem", color: "#64748b" }}>Loading courses…</p>}
          {errorCourses && <p style={{ padding: "1rem", color: "#dc2626" }}>Error: {errorCourses}</p>}

          {!loadingCourses && !errorCourses && (
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {filteredCourses.map(course => {
                const isIntern = internCourseIds.has(course.course_id);
                const isChecked = completed.includes(course.course_id);
                return isIntern ? (
                  <div key={course.course_id} style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.6rem 1rem", borderBottom: "1px solid #f1f5f9",
                    background: internCredits[course.course_id] > 0 ? "#f0fdf4" : "white",
                  }}>
                    <span style={{ flex: 1, fontSize: "0.875rem" }}>
                      <span style={{ fontWeight: 600, color: "#0a2a43" }}>{course.course_id}</span>
                      <span style={{ color: "#64748b" }}> — {course.title}</span>
                      <span style={{ marginLeft: "0.4rem", fontSize: "0.75rem", color: "#b45309", fontWeight: 600 }}>Internship</span>
                    </span>
                    <select value={internCredits[course.course_id] ?? 0} onChange={e => setInternAmount(course.course_id, e.target.value)}
                      style={{ padding: "0.25rem 0.5rem", borderRadius: 5, border: "1px solid #e2e8f0", fontSize: "0.8rem" }}>
                      <option value={0}>Not taken</option>
                      <option value={1}>1 credit</option>
                      <option value={2}>2 credits</option>
                      <option value={3}>3 credits</option>
                      <option value={4}>4 credits</option>
                    </select>
                  </div>
                ) : (
                  <label key={course.course_id} style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.6rem 1rem", borderBottom: "1px solid #f1f5f9",
                    background: isChecked ? "#f0f9ff" : "white", cursor: "pointer",
                  }}>
                    <input type="checkbox" checked={isChecked} onChange={() => toggleCourse(course.course_id)}
                      style={{ width: 16, height: 16, accentColor: "#1d4ed8", cursor: "pointer" }} />
                    <span style={{ flex: 1, fontSize: "0.875rem" }}>
                      <span style={{ fontWeight: 600, color: "#0a2a43" }}>{course.course_id}</span>
                      <span style={{ color: "#64748b" }}> — {course.title}</span>
                    </span>
                    {course.credits && <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{course.credits} cr</span>}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Run button */}
        <button onClick={runAudit} disabled={loading || !degree} style={{
          width: "100%", padding: "0.85rem", background: loading || !degree ? "#94a3b8" : "#0a2a43",
          color: "white", border: "none", borderRadius: 8, fontWeight: 700,
          fontSize: "1rem", cursor: loading || !degree ? "not-allowed" : "pointer",
          marginBottom: "1.5rem", transition: "background 0.15s",
        }}>
          {loading ? "Running Audit…" : "Run Degree Audit"}
        </button>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "0.85rem 1rem", color: "#991b1b", marginBottom: "1.5rem" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Progress bar */}
            <div style={CARD}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0a2a43" }}>Overall Progress</h2>
                <span style={{ fontSize: "1.5rem", fontWeight: 800, color: progressPct >= 80 ? "#059669" : progressPct >= 50 ? "#d97706" : "#dc2626" }}>
                  {progressPct}%
                </span>
              </div>
              <div style={{ background: "#e2e8f0", borderRadius: 99, height: 12, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 99, transition: "width 0.6s ease",
                  width: `${progressPct}%`,
                  background: progressPct >= 80 ? "#10b981" : progressPct >= 50 ? "#f59e0b" : "#ef4444",
                }} />
              </div>
              <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.85rem", fontSize: "0.85rem", color: "#64748b" }}>
                <span>Program: <strong style={{ color: "#0a2a43" }}>{result.degree}</strong></span>
                {result.internship_satisfied !== undefined && (
                  <span>Internship: <strong style={{ color: result.internship_satisfied ? "#059669" : "#dc2626" }}>
                    {result.internship_satisfied ? "✓ Complete" : "○ Needed"}
                  </strong></span>
                )}
                <span>Electives: <strong style={{ color: result.elective_satisfied ? "#059669" : "#dc2626" }}>
                  {result.elective_satisfied ? "✓ Satisfied" : `${result.remaining_requirements?.elective_slots_remaining} remaining`}
                </strong></span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              {/* Completed core */}
              <div style={CARD}>
                <h3 style={{ margin: "0 0 0.85rem", fontSize: "0.95rem", fontWeight: 700, color: "#065f46", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  ✓ Completed Core
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {result.completed_core?.length
                    ? result.completed_core.map(c => <span key={c} style={BADGE("green")}>{c}</span>)
                    : <span style={{ color: "#64748b", fontSize: "0.875rem" }}>None yet</span>}
                </div>
              </div>

              {/* Remaining core */}
              <div style={CARD}>
                <h3 style={{ margin: "0 0 0.85rem", fontSize: "0.95rem", fontWeight: 700, color: "#991b1b", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  ○ Remaining Core
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {result.remaining_core?.length
                    ? result.remaining_core.map(c => <span key={c} style={BADGE("red")}>{c}</span>)
                    : <span style={{ color: "#64748b", fontSize: "0.875rem" }}>All done! 🎉</span>}
                </div>
              </div>
            </div>

            {/* Recommended next */}
            {result.recommended_order?.length > 0 && (
              <div style={CARD}>
                <h3 style={{ margin: "0 0 0.85rem", fontSize: "0.95rem", fontWeight: 700, color: "#0a2a43" }}>
                  🎯 Recommended Next Courses
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {result.recommended_order.map(c => <span key={c} style={BADGE("blue")}>{c}</span>)}
                </div>
              </div>
            )}

            {/* Notes */}
            {result.notes && (
              <div style={{ ...CARD, background: "#fffbeb", border: "1px solid #fde68a" }}>
                <p style={{ margin: 0, color: "#78350f", fontSize: "0.9rem" }}>📌 {result.notes}</p>
              </div>
            )}

            {/* Distinct credits CTA */}
            {(degree === "CTIS_MAJOR" || degree === "CYBER_MAJOR") && (
              <div style={{ ...CARD, background: "#f0f7ff", border: "1px solid #bfdbfe", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <p style={{ margin: "0 0 0.25rem", fontWeight: 600, color: "#0a2a43" }}>Pursuing a second program?</p>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem" }}>Check whether your combination meets the distinct credit requirement.</p>
                </div>
                <Link to={distinctLink} style={{
                  display: "inline-block", padding: "0.6rem 1.25rem",
                  background: "#0a2a43", color: "white", borderRadius: 7,
                  fontWeight: 600, textDecoration: "none", fontSize: "0.9rem", whiteSpace: "nowrap",
                }}>
                  Check Distinct Credits →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}