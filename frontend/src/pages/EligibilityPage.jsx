import { useState, useEffect } from "react";
import { getCourses, getEligibility } from "../api";
import { useSavedCourses } from "../hooks/useSavedCourses";


const CARD = {
  background: "white", border: "1px solid #e2e8f0",
  borderRadius: 10, padding: "1.5rem",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};

export default function EligibilityPage() {
  const [courseId, setCourseId] = useState("");
const { completed, toggleCourse } = useSavedCourses();
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

  const filteredCourses = allCourses.filter(c =>
    c.course_id.toLowerCase().includes(search.toLowerCase()) ||
    c.title?.toLowerCase().includes(search.toLowerCase())
  );



  async function runEligibility() {
    setLoading(true); setError(null); setResult(null);
    try { setResult(await getEligibility(courseId, completed)); }
    catch  { setError("Failed to check eligibility. Please try again."); }
    finally { setLoading(false); }
  }

  const selectedCourse = allCourses.find(c => c.course_id === courseId);

  return (
    <div>
      {/* Page header */}
      <div style={{ background: "linear-gradient(135deg, #0a1f35 0%, #0a3a6b 100%)", color: "white", padding: "2.5rem 2rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontSize: "2.25rem", marginBottom: "0.5rem" }}>✅</div>
          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700 }}>Course Eligibility Checker</h1>
          <p style={{ margin: "0.5rem 0 0", color: "#93c5fd", fontSize: "1rem" }}>
            Select a course you want to take, check off what you've completed, and find out instantly if you're eligible.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>

          {/* Course selector */}
          <div style={CARD}>
            <label style={{ display: "block", fontWeight: 600, color: "#0a2a43", marginBottom: "0.5rem", fontSize: "0.875rem" }}>
              Course to Check
            </label>
            <select value={courseId} onChange={e => setCourseId(e.target.value)} style={{
              width: "100%", padding: "0.65rem 0.75rem", borderRadius: 7,
              border: "1.5px solid #e2e8f0", fontSize: "0.95rem", background: "white",
              color: courseId ? "#0a2a43" : "#94a3b8", cursor: "pointer",
            }}>
              <option value="">— Select a course —</option>
              {allCourses.map(c => (
                <option key={c.course_id} value={c.course_id}>{c.course_id} — {c.title}</option>
              ))}
            </select>
            {selectedCourse && (
              <div style={{ marginTop: "0.65rem", padding: "0.6rem 0.75rem", background: "#f0f7ff", borderRadius: 6, fontSize: "0.85rem", color: "#1e40af" }}>
                {selectedCourse.credits} credits · Offered: {selectedCourse.term_offered}
              </div>
            )}
          </div>

          {/* Summary */}
          <div style={{ ...CARD, background: "#f0f7ff", border: "1px solid #bfdbfe", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: "0.8rem", color: "#1e40af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>
              Completed Selected
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0a2a43" }}>{completed.length}</div>
            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem" }}>courses checked off</div>
          </div>
        </div>

        {/* Course checklist */}
        <div style={{ ...CARD, marginBottom: "1.25rem", padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1rem" }}>📋</span>
            <span style={{ fontWeight: 600, color: "#0a2a43", fontSize: "0.9rem" }}>Courses You've Completed</span>
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
                const isChecked = completed.includes(course.course_id);
                const isTarget = course.course_id === courseId;
                return (
                  <label key={course.course_id} style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.6rem 1rem", borderBottom: "1px solid #f1f5f9",
                    background: isTarget ? "#fef9c3" : isChecked ? "#f0f9ff" : "white",
                    cursor: isTarget ? "not-allowed" : "pointer", opacity: isTarget ? 0.6 : 1,
                  }}>
                    <input type="checkbox" checked={isChecked} disabled={isTarget}
                      onChange={() => toggleCourse(course.course_id)}
                      style={{ width: 16, height: 16, accentColor: "#1d4ed8", cursor: isTarget ? "not-allowed" : "pointer" }} />
                    <span style={{ flex: 1, fontSize: "0.875rem" }}>
                      <span style={{ fontWeight: 600, color: "#0a2a43" }}>{course.course_id}</span>
                      <span style={{ color: "#64748b" }}> — {course.title}</span>
                    </span>
                    {isTarget && <span style={{ fontSize: "0.75rem", color: "#92400e", fontWeight: 600 }}>TARGET</span>}
                    {course.credits && !isTarget && <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{course.credits} cr</span>}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Check button */}
        <button onClick={runEligibility} disabled={loading || !courseId} style={{
          width: "100%", padding: "0.85rem",
          background: loading || !courseId ? "#94a3b8" : "#0a2a43",
          color: "white", border: "none", borderRadius: 8, fontWeight: 700,
          fontSize: "1rem", cursor: loading || !courseId ? "not-allowed" : "pointer",
          marginBottom: "1.5rem",
        }}>
          {loading ? "Checking…" : "Check Eligibility"}
        </button>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "0.85rem 1rem", color: "#991b1b", marginBottom: "1.5rem" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Eligible YES/NO banner */}
            <div style={{
              ...CARD,
              background: result.eligible ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${result.eligible ? "#86efac" : "#fca5a5"}`,
              display: "flex", alignItems: "center", gap: "1rem",
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "1.5rem", flexShrink: 0,
                background: result.eligible ? "#dcfce7" : "#fee2e2",
              }}>
                {result.eligible ? "✓" : "✕"}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "1.15rem", color: result.eligible ? "#166534" : "#991b1b" }}>
                  {result.eligible ? "You are eligible!" : "Not yet eligible"}
                </div>
                <div style={{ color: result.eligible ? "#166534" : "#991b1b", fontSize: "0.875rem", marginTop: "0.2rem", opacity: 0.8 }}>
                  {result.course_id}
                </div>
              </div>
            </div>

            {/* Missing prerequisites */}
            {result.missing?.length > 0 && (
              <div style={CARD}>
                <h3 style={{ margin: "0 0 0.85rem", fontSize: "0.95rem", fontWeight: 700, color: "#991b1b" }}>
                  Missing Prerequisites
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {result.missing.map((m, idx) => {
                    let display = m;
                    if (Array.isArray(m)) display = m.join(" or ");
                    else if (m === null || m === undefined) display = "Unknown prerequisite";
                    else if (typeof m !== "string") display = String(m);
                    else if (m.includes(",")) display = m.split(",").map((p, i) => i === 0 ? p.trim() : `or ${p.trim()}`).join(", ");
                    return (
                      <div key={idx} style={{
                        padding: "0.5rem 0.85rem", background: "#fef2f2", borderRadius: 6,
                        fontSize: "0.875rem", color: "#991b1b", fontWeight: 500, borderLeft: "3px solid #fca5a5",
                      }}>
                        {display}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Explanation */}
            {result.explanation && (
              <div style={{ ...CARD, background: "#fffbeb", border: "1px solid #fde68a" }}>
                <p style={{ margin: 0, color: "#78350f", fontSize: "0.9rem" }}>📌 {result.explanation}</p>
              </div>
            )}

            {/* Next courses */}
            {result.next_courses?.length > 0 && (
              <div style={CARD}>
                <h3 style={{ margin: "0 0 0.85rem", fontSize: "0.95rem", fontWeight: 700, color: "#0a2a43" }}>
                  Suggested Next Steps
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {result.next_courses.map(c => (
                    <span key={c} style={{
                      padding: "0.25rem 0.65rem", background: "#f1f5f9", borderRadius: 5,
                      fontSize: "0.85rem", fontWeight: 600, color: "#334155",
                    }}>{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}