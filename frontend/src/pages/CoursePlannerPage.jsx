import { useState, useEffect } from "react";
import { getCourses, getPlan } from "../api";
import { useSavedCourses } from "../hooks/useSavedCourses";


const CARD = {
  background: "white", border: "1px solid #e2e8f0",
  borderRadius: 10, padding: "1.5rem",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};

const cyberCourses = ["CTIS 370", "CTIS 371", "CTIS 471"];
const ctisCourses  = ["CTIS 342", "CTIS 345", "CTIS 331", "CTIS 322"];

export default function CoursePlannerPage() {
const { completed, degree, setDegree, toggleCourse } = useSavedCourses();
const [term, setTerm] = useState(""); 
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState("");
  const [allCourses, setAllCourses]       = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [errorCourses, setErrorCourses]   = useState(null);

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

  
  function annotate(courseId) {
    if ((degree === "CNS_MAJOR" || degree === "CNS_MINOR") && cyberCourses.includes(courseId))
      return { id: courseId, tag: "Cyber Core", tagColor: "#7c3aed" };
    if ((degree === "CTIS_MAJOR" || degree === "CTIS_MINOR") && ctisCourses.includes(courseId))
      return { id: courseId, tag: "CTIS Core", tagColor: "#0369a1" };
    return { id: courseId, tag: null };
  }

  async function runPlan() {
    setLoading(true); setError(null); setResult(null);
    try { setResult(await getPlan({ degree, completed, upcomingTerm: term })); }
    catch { setError("Failed to generate plan. Please try again."); }
    finally { setLoading(false); }
  }

  const canRun = degree && term && !loading;

  return (
    <div>
      {/* Page header */}
      <div style={{ background: "linear-gradient(135deg, #0a1f35 0%, #0a3a6b 100%)", color: "white", padding: "2.5rem 2rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontSize: "2.25rem", marginBottom: "0.5rem" }}>🗓️</div>
          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700 }}>Course Planner</h1>
          <p style={{ margin: "0.5rem 0 0", color: "#93c5fd", fontSize: "1rem" }}>
            Select your program and upcoming term to get personalized course recommendations for what to take next.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>

          {/* Degree */}
          <div style={CARD}>
            <label style={{ display: "block", fontWeight: 600, color: "#0a2a43", marginBottom: "0.5rem", fontSize: "0.875rem" }}>
              Degree Program
            </label>
            <select value={degree} onChange={e => setDegree(e.target.value)} style={{
              width: "100%", padding: "0.65rem 0.75rem", borderRadius: 7,
              border: "1.5px solid #e2e8f0", fontSize: "0.95rem", background: "white",
              color: degree ? "#0a2a43" : "#94a3b8", cursor: "pointer",
            }}>
              <option value="">— Select —</option>
              <option value="CTIS_MAJOR">CTIS Major</option>
              <option value="CTIS_MINOR">CTIS Minor</option>
              <option value="CNS_MAJOR">Cybersecurity Major</option>
              <option value="CNS_MINOR">Cybersecurity Minor</option>
            </select>
          </div>

          {/* Term */}
          <div style={CARD}>
            <label style={{ display: "block", fontWeight: 600, color: "#0a2a43", marginBottom: "0.5rem", fontSize: "0.875rem" }}>
              Upcoming Term
            </label>
            <select value={term} onChange={e => setTerm(e.target.value)} style={{
              width: "100%", padding: "0.65rem 0.75rem", borderRadius: 7,
              border: "1.5px solid #e2e8f0", fontSize: "0.95rem", background: "white",
              color: term ? "#0a2a43" : "#94a3b8", cursor: "pointer",
            }}>
              <option value="">— Select —</option>
              <option value="Fall">🍂 Fall</option>
              <option value="Spring">🌸 Spring</option>
            </select>
          </div>

          {/* Summary */}
          <div style={{ ...CARD, background: "#f0f7ff", border: "1px solid #bfdbfe", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: "0.8rem", color: "#1e40af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>
              Courses Completed
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0a2a43" }}>{completed.length}</div>
            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem" }}>checked off</div>
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
          {errorCourses  && <p style={{ padding: "1rem", color: "#dc2626" }}>Error: {errorCourses}</p>}

          {!loadingCourses && !errorCourses && (
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {filteredCourses.map(course => {
                const isChecked = completed.includes(course.course_id);
                return (
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

        {/* Generate button */}
        <button onClick={runPlan} disabled={!canRun} style={{
          width: "100%", padding: "0.85rem",
          background: !canRun ? "#94a3b8" : "#0a2a43",
          color: "white", border: "none", borderRadius: 8, fontWeight: 700,
          fontSize: "1rem", cursor: !canRun ? "not-allowed" : "pointer",
          marginBottom: "1.5rem",
        }}>
          {loading ? "Generating Plan…" : "Generate Course Plan"}
        </button>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "0.85rem 1rem", color: "#991b1b", marginBottom: "1.5rem" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            <div style={{ ...CARD, background: "#f0fdf4", border: "1px solid #86efac" }}>
              <p style={{ margin: 0, fontWeight: 600, color: "#166534", fontSize: "0.95rem" }}>
                📅 Plan generated for <strong>{result.upcomingTerm}</strong> term
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              {/* Top 4 recommended */}
              <div style={CARD}>
                <h3 style={{ margin: "0 0 1rem", fontSize: "0.95rem", fontWeight: 700, color: "#0a2a43" }}>
                  🎯 Top 4 Recommended
                </h3>
                {result.recommended_courses?.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {result.recommended_courses.map((c, i) => {
                      const { id, tag, tagColor } = annotate(c);
                      return (
                        <div key={c} style={{
                          display: "flex", alignItems: "center", gap: "0.6rem",
                          padding: "0.6rem 0.85rem", background: "#f8fafc",
                          borderRadius: 7, border: "1px solid #e2e8f0",
                        }}>
                          <span style={{
                            width: 22, height: 22, borderRadius: "50%", background: "#0a2a43",
                            color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.7rem", fontWeight: 700, flexShrink: 0,
                          }}>{i + 1}</span>
                          <span style={{ fontWeight: 600, color: "#0a2a43", fontSize: "0.875rem" }}>{id}</span>
                          {tag && (
                            <span style={{
                              marginLeft: "auto", fontSize: "0.7rem", fontWeight: 700,
                              color: tagColor, background: tagColor + "18",
                              padding: "0.15rem 0.5rem", borderRadius: 4,
                            }}>{tag}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ color: "#64748b", fontSize: "0.875rem" }}>No recommendations available.</p>
                )}
              </div>

              {/* Eligible now */}
              <div style={CARD}>
                <h3 style={{ margin: "0 0 1rem", fontSize: "0.95rem", fontWeight: 700, color: "#0a2a43" }}>
                  ✓ Eligible to Take Now
                </h3>
                {result.eligible_now?.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {result.eligible_now.map(c => {
                      const { id, tag, tagColor } = annotate(c);
                      return (
                        <span key={c} style={{
                          display: "inline-flex", alignItems: "center", gap: "0.35rem",
                          padding: "0.3rem 0.7rem", background: "#f1f5f9",
                          borderRadius: 5, fontSize: "0.825rem", fontWeight: 600, color: "#334155",
                        }}>
                          {id}
                          {tag && <span style={{ fontSize: "0.65rem", color: tagColor, fontWeight: 700 }}>• {tag}</span>}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ color: "#64748b", fontSize: "0.875rem" }}>No additional eligible courses found.</p>
                )}
              </div>
            </div>

            <div style={{ ...CARD, background: "#fffbeb", border: "1px solid #fde68a" }}>
              <p style={{ margin: 0, color: "#78350f", fontSize: "0.875rem" }}>
                📌 Electives, internships, and independent studies are not shown here. Check your Degree Audit for remaining elective requirements.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}