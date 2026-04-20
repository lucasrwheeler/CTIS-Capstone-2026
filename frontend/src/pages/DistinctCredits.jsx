import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getDistinctCredits, getDegreeAudit, getCourses } from "../api";

const PROGRAMS = [
  { value: "CTIS_MAJOR", label: "CTIS Major" },
  { value: "CNS_MAJOR",  label: "CNS Major"  },
  { value: "CTIS_MINOR", label: "CTIS Minor" },
  { value: "CNS_MINOR",  label: "CNS Minor"  },
];

const PROGRAM_LABEL = {
  CTIS_MAJOR: "CTIS Major",
  CNS_MAJOR:  "CNS Major",
  CTIS_MINOR: "CTIS Minor",
  CNS_MINOR:  "CNS Minor",
};

function CourseChip({ courseId, done, credits }) {
  return (
    <Link
      to={`/courses?open=${encodeURIComponent(courseId)}`}
      title={`${courseId} — ${credits} credit${credits !== 1 ? "s" : ""}`}
      style={{
        padding: "0.35rem 0.8rem",
        borderRadius: 6,
        fontSize: "0.875rem",
        fontWeight: 600,
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        ...(done
          ? { background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" }
          : { background: "#f8fafc", color: "#64748b", border: "1px dashed #cbd5e1" }
        ),
      }}
    >
      {done ? "✓" : "○"} {courseId}
      <span style={{ fontSize: "0.75rem", opacity: 0.75, fontWeight: 400 }}>
        {credits} cr
      </span>
    </Link>
  );
}

function CourseSection({ title, subtitle, courses, completedSet, creditMap, accentColor }) {
  const totalCredits  = courses.reduce((s, c) => s + (creditMap[c] ?? 4), 0);
  const doneCredits   = courses.filter(c => completedSet.has(c)).reduce((s, c) => s + (creditMap[c] ?? 4), 0);
  const showPersonal  = completedSet.size > 0;

  return (
    <div className="professor-card" style={{ margin: "0 0 1.25rem", borderLeft: `4px solid ${accentColor}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.25rem", marginBottom: "0.5rem" }}>
        <div>
          <h3 style={{ margin: 0, color: "#0a2a43" }}>{title}</h3>
          {subtitle && <p style={{ margin: "0.15rem 0 0", fontSize: "0.85rem", color: "#718096" }}>{subtitle}</p>}
        </div>
        <div style={{ textAlign: "right", fontSize: "0.875rem" }}>
          <span style={{ fontWeight: 700, color: "#0a2a43" }}>{totalCredits} credits</span>
          {showPersonal && (
            <span style={{ color: "#718096", marginLeft: "0.4rem" }}>
              ({doneCredits} completed)
            </span>
          )}
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {courses.map(c => (
          <CourseChip
            key={c}
            courseId={c}
            done={completedSet.has(c)}
            credits={creditMap[c] ?? 4}
          />
        ))}
      </div>
    </div>
  );
}

function ElectiveSection({ title, courses, slots, completedSet, creditMap, accentColor }) {
  const doneCount    = courses.filter(c => completedSet.has(c)).length;
  const showPersonal = completedSet.size > 0;

  return (
    <div className="professor-card" style={{ margin: 0, borderLeft: `4px solid ${accentColor}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.25rem", marginBottom: "0.5rem" }}>
        <h3 style={{ margin: 0, color: "#0a2a43", fontSize: "1rem" }}>{title}</h3>
        <div style={{ textAlign: "right", fontSize: "0.875rem" }}>
          <span style={{ fontWeight: 700, color: "#0a2a43" }}>Choose {slots}</span>
          {showPersonal && (
            <span style={{ color: doneCount >= slots ? "#065f46" : "#718096", marginLeft: "0.4rem" }}>
              ({doneCount} completed)
            </span>
          )}
        </div>
      </div>
      <p style={{ margin: "0 0 0.6rem", color: "#4a5568", fontSize: "0.85rem" }}>
        Select <strong>{slots}</strong> elective{slots !== 1 ? "s" : ""} from {courses.length} options
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {courses.map(c => (
          <CourseChip
            key={c}
            courseId={c}
            done={completedSet.has(c)}
            credits={creditMap[c] ?? 4}
          />
        ))}
      </div>
    </div>
  );
}

export default function DistinctCredits() {
  const [searchParams] = useSearchParams();

  const completedParam = searchParams.get("completed") || "";
  const preCompleted = completedParam
    ? completedParam.split(",").map(c => decodeURIComponent(c))
    : [];

  const [programA, setProgramA] = useState(searchParams.get("programA") || "");
  const [programB, setProgramB] = useState(searchParams.get("programB") || "");
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  // Parse internship credit overrides forwarded from degree audit (JSON-encoded)
  let internCreditOverrides = {};
  try {
    const raw = searchParams.get("internCredits");
    if (raw) internCreditOverrides = JSON.parse(raw);
  } catch {
    internCreditOverrides = {};
  }

  const completedSet = new Set(preCompleted);
  const sameProgram  = programA && programB && programA === programB;

  async function submit() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const [distinct, auditA, auditB, courses] = await Promise.all([
        getDistinctCredits(programA, programB),
        getDegreeAudit(programA, []),
        getDegreeAudit(programB, []),
        getCourses(),
      ]);

      if (distinct.error) throw new Error(distinct.error);
      if (auditA.error)   throw new Error(auditA.error);
      if (auditB.error)   throw new Error(auditB.error);

      const creditMap = {};
      (courses || []).forEach(c => { creditMap[c.course_id] = parseInt(c.credits) || 4; });
      // Apply student-declared internship credit amounts (overrides DB value)
      Object.assign(creditMap, internCreditOverrides);

      const internshipA = new Set(auditA.remaining_requirements?.internship || []);
      const internshipB = new Set(auditB.remaining_requirements?.internship || []);
      const allInternships = new Set([...internshipA, ...internshipB]);

      const coreA = new Set(auditA.remaining_core || []);
      const coreB = new Set(auditB.remaining_core || []);

      const coreOnlyA    = [...coreA].filter(c => !coreB.has(c) && !allInternships.has(c)).sort();
      const coreOnlyB    = [...coreB].filter(c => !coreA.has(c) && !allInternships.has(c)).sort();
      const sharedCore   = [...coreA].filter(c =>  coreB.has(c) && !allInternships.has(c)).sort();
      const sharedIntern = [...allInternships].filter(c => internshipA.has(c) && internshipB.has(c)).sort();
      const internOnlyA  = [...internshipA].filter(c => !internshipB.has(c)).sort();
      const internOnlyB  = [...internshipB].filter(c => !internshipA.has(c)).sort();

      const electivesA = (auditA.remaining_requirements?.elective_options || []).sort();
      const electivesB = (auditB.remaining_requirements?.elective_options || []).sort();
      const slotsA     = auditA.remaining_requirements?.elective_slots_remaining ?? 0;
      const slotsB     = auditB.remaining_requirements?.elective_slots_remaining ?? 0;

      const sum = arr => arr.reduce((s, c) => s + (creditMap[c] ?? 4), 0);

      const creditsOnlyA   = sum(coreOnlyA);
      const creditsOnlyB   = sum(coreOnlyB);
      const creditsShared  = sum(sharedCore) + sum(sharedIntern);
      const creditsIntern  = sum(sharedIntern);

      const allDistinct = distinct.distinct_courses || [];
      const personalCompleted = allDistinct.filter(c => completedSet.has(c));
      const personalCredits   = personalCompleted.reduce((s, c) => s + (creditMap[c] ?? 4), 0);
      const threshold         = distinct.required_distinct_credits || 64;
      const personalMeets     = personalCredits >= threshold;

      setResult({
        distinct,
        programA,
        programB,
        creditMap,
        coreOnlyA,
        coreOnlyB,
        sharedCore,
        sharedIntern,
        internOnlyA,
        internOnlyB,
        electivesA,
        electivesB,
        slotsA,
        slotsB,
        creditsOnlyA,
        creditsOnlyB,
        creditsShared,
        creditsIntern,
        threshold,
        personalCredits,
        personalMeets,
        personalCompleted,
        hasPersonal: preCompleted.length > 0,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <Link to="/" style={{ color: "#0a4a8a", textDecoration: "none", fontSize: "0.9rem" }}>
        ← Back to Home
      </Link>

      <h1 className="page-title" style={{ marginTop: "1rem" }}>Distinct Credits Calculator</h1>

      {preCompleted.length > 0 && (
        <div style={{
          padding: "0.6rem 1rem",
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: 6,
          fontSize: "0.875rem",
          color: "#1e40af",
          marginBottom: "1rem",
        }}>
          Loaded with <strong>{preCompleted.length} completed course{preCompleted.length !== 1 ? "s" : ""}</strong> from your degree audit —
          chips marked <strong>✓</strong> are ones you have already taken.
        </div>
      )}

      <p style={{ color: "#4a5568", marginBottom: "1.5rem" }}>
        Select two programs to see how their required courses overlap, what is distinct to each, and how your completed courses stack up.
      </p>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "0.5rem", alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: "0.35rem", color: "#0a2a43" }}>Program A</label>
          <select value={programA} onChange={e => setProgramA(e.target.value)}
            style={{ width: "100%", padding: "0.6rem", fontSize: "1rem", borderRadius: 6, border: "1px solid #ccc" }}>
            <option value="">— Select —</option>
            {PROGRAMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: 180 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: "0.35rem", color: "#0a2a43" }}>Program B</label>
          <select value={programB} onChange={e => setProgramB(e.target.value)}
            style={{ width: "100%", padding: "0.6rem", fontSize: "1rem", borderRadius: 6, border: "1px solid #ccc" }}>
            <option value="">— Select —</option>
            {PROGRAMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <button
          onClick={submit}
          disabled={!programA || !programB || sameProgram || loading}
          style={{
            padding: "0.65rem 1.25rem",
            background: (!programA || !programB || sameProgram) ? "#94a3b8" : "#0a4a8a",
            color: "white", borderRadius: 6, border: "none", fontSize: "1rem",
            cursor: (!programA || !programB || sameProgram) ? "not-allowed" : "pointer",
          }}>
          {loading ? "Calculating…" : "Calculate"}
        </button>
      </div>

      {sameProgram && (
        <p style={{ color: "#c05621", fontSize: "0.9rem", marginTop: "0.25rem" }}>Please select two different programs.</p>
      )}
      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: "2rem" }}>

          {/* Credit summary strip */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}>
            {[
              { label: `${PROGRAM_LABEL[result.programA]} only`, value: result.creditsOnlyA, color: "#0a4a8a" },
              { label: "Shared (counted once)", value: result.creditsShared, color: "#718096" },
              { label: `${PROGRAM_LABEL[result.programB]} only`, value: result.creditsOnlyB, color: "#276749" },
              { label: "Distinct credit threshold", value: result.threshold, color: "#92400e", isThreshold: true },
            ].map(({ label, value, color, isThreshold }) => (
              <div key={label} style={{
                padding: "0.85rem 1rem",
                borderRadius: 8,
                background: isThreshold ? "#fefce8" : "#f8fafc",
                border: `1px solid ${isThreshold ? "#fde68a" : "#e2e8f0"}`,
                borderTop: `3px solid ${color}`,
                textAlign: "center",
              }}>
                <div style={{ fontSize: "1.6rem", fontWeight: 700, color }}>{value}</div>
                <div style={{ fontSize: "0.78rem", color: "#718096", marginTop: "0.2rem" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Personal progress banner — only shown when coming from degree audit */}
          {result.hasPersonal && (
            <div style={{
              padding: "1rem 1.25rem",
              borderRadius: 8,
              marginBottom: "1.75rem",
              background: result.personalMeets ? "#f0fdf4" : "#fff7ed",
              border: `1px solid ${result.personalMeets ? "#86efac" : "#fdba74"}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}>
              <div>
                <p style={{ margin: "0 0 0.1rem", fontSize: "0.75rem", color: "#718096", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Your Personal Progress
                </p>
                <strong style={{ fontSize: "1rem", color: result.personalMeets ? "#166534" : "#9a3412" }}>
                  {result.personalMeets
                    ? "✓ You have completed enough distinct credits"
                    : `○ You still need ${result.threshold - result.personalCredits} more distinct credits`}
                </strong>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.875rem", color: "#4a5568" }}>
                  {result.personalCompleted.length} of {result.distinct.distinct_courses?.length} distinct courses completed
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "2rem", fontWeight: 700, color: "#0a2a43" }}>
                  {result.personalCredits}
                </span>
                <span style={{ color: "#4a5568" }}> / {result.threshold} credits</span>
              </div>
            </div>
          )}

          {/* A-only core */}
          {result.coreOnlyA.length > 0 && (
            <CourseSection
              title={`${PROGRAM_LABEL[result.programA]} — Exclusive Required Courses`}
              subtitle={`Required only by ${PROGRAM_LABEL[result.programA]}`}
              courses={result.coreOnlyA}
              completedSet={completedSet}
              creditMap={result.creditMap}
              accentColor="#0a4a8a"
            />
          )}

          {/* A-only internship */}
          {result.internOnlyA.length > 0 && (
            <div className="professor-card" style={{ margin: "0 0 1.25rem", borderLeft: "4px solid #b45309" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.25rem", marginBottom: "0.5rem" }}>
                <div>
                  <h3 style={{ margin: 0, color: "#0a2a43" }}>Internship — {PROGRAM_LABEL[result.programA]} Only</h3>
                  <p style={{ margin: "0.15rem 0 0", fontSize: "0.85rem", color: "#718096" }}>
                    Required by {PROGRAM_LABEL[result.programA]} — not required by {PROGRAM_LABEL[result.programB]}
                  </p>
                </div>
                <div style={{ textAlign: "right", fontSize: "0.875rem" }}>
                  <span style={{ fontWeight: 700, color: "#0a2a43" }}>
                    {result.internOnlyA.reduce((s, c) => s + (result.creditMap[c] ?? 4), 0)} credits
                  </span>
                  {completedSet.size > 0 && (
                    <span style={{ color: "#718096", marginLeft: "0.4rem" }}>
                      ({result.internOnlyA.filter(c => completedSet.has(c)).reduce((s, c) => s + (result.creditMap[c] ?? 4), 0)} cr completed)
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {result.internOnlyA.map(c => (
                  <CourseChip key={c} courseId={c} done={completedSet.has(c)} credits={result.creditMap[c] ?? 4} />
                ))}
              </div>
            </div>
          )}

          {/* B-only core */}
          {result.coreOnlyB.length > 0 && (
            <CourseSection
              title={`${PROGRAM_LABEL[result.programB]} — Exclusive Required Courses`}
              subtitle={`Required only by ${PROGRAM_LABEL[result.programB]}`}
              courses={result.coreOnlyB}
              completedSet={completedSet}
              creditMap={result.creditMap}
              accentColor="#276749"
            />
          )}

          {/* B-only internship */}
          {result.internOnlyB.length > 0 && (
            <div className="professor-card" style={{ margin: "0 0 1.25rem", borderLeft: "4px solid #b45309" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.25rem", marginBottom: "0.5rem" }}>
                <div>
                  <h3 style={{ margin: 0, color: "#0a2a43" }}>Internship — {PROGRAM_LABEL[result.programB]} Only</h3>
                  <p style={{ margin: "0.15rem 0 0", fontSize: "0.85rem", color: "#718096" }}>
                    Required by {PROGRAM_LABEL[result.programB]} — not required by {PROGRAM_LABEL[result.programA]}
                  </p>
                </div>
                <div style={{ textAlign: "right", fontSize: "0.875rem" }}>
                  <span style={{ fontWeight: 700, color: "#0a2a43" }}>
                    {result.internOnlyB.reduce((s, c) => s + (result.creditMap[c] ?? 4), 0)} credits
                  </span>
                  {completedSet.size > 0 && (
                    <span style={{ color: "#718096", marginLeft: "0.4rem" }}>
                      ({result.internOnlyB.filter(c => completedSet.has(c)).reduce((s, c) => s + (result.creditMap[c] ?? 4), 0)} cr completed)
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {result.internOnlyB.map(c => (
                  <CourseChip key={c} courseId={c} done={completedSet.has(c)} credits={result.creditMap[c] ?? 4} />
                ))}
              </div>
            </div>
          )}

          {/* Shared required (non-internship) */}
          {result.sharedCore.length > 0 && (
            <CourseSection
              title="Shared Required Courses"
              subtitle="Required by both programs — counted once toward distinct credits"
              courses={result.sharedCore}
              completedSet={completedSet}
              creditMap={result.creditMap}
              accentColor="#718096"
            />
          )}

          {/* Internship (shared) */}
          {result.sharedIntern.length > 0 && (
            <div className="professor-card" style={{ margin: "0 0 1.25rem", borderLeft: "4px solid #b45309" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.25rem", marginBottom: "0.5rem" }}>
                <div>
                  <h3 style={{ margin: 0, color: "#0a2a43" }}>Internship — Shared</h3>
                  <p style={{ margin: "0.15rem 0 0", fontSize: "0.85rem", color: "#718096" }}>
                    Required by both programs — CTIS 290 and CTIS 390 satisfy the same internship requirement
                  </p>
                </div>
                <div style={{ textAlign: "right", fontSize: "0.875rem" }}>
                  <span style={{ fontWeight: 700, color: "#0a2a43" }}>
                    {result.sharedIntern.reduce((s, c) => s + (result.creditMap[c] ?? 4), 0)} credits
                  </span>
                  {completedSet.size > 0 && (
                    <span style={{ color: "#718096", marginLeft: "0.4rem" }}>
                      ({result.sharedIntern.filter(c => completedSet.has(c)).reduce((s, c) => s + (result.creditMap[c] ?? 4), 0)} cr completed)
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {result.sharedIntern.map(c => (
                  <CourseChip key={c} courseId={c} done={completedSet.has(c)} credits={result.creditMap[c] ?? 4} />
                ))}
              </div>
            </div>
          )}

          {/* Electives side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginTop: "0.25rem" }}>
            {result.electivesA.length > 0 && (
              <ElectiveSection
                title={`${PROGRAM_LABEL[result.programA]} Electives`}
                courses={result.electivesA}
                slots={result.slotsA}
                completedSet={completedSet}
                creditMap={result.creditMap}
                accentColor="#0a4a8a"
              />
            )}
            {result.electivesB.length > 0 && (
              <ElectiveSection
                title={`${PROGRAM_LABEL[result.programB]} Electives`}
                courses={result.electivesB}
                slots={result.slotsB}
                completedSet={completedSet}
                creditMap={result.creditMap}
                accentColor="#276749"
              />
            )}
          </div>

        </div>
      )}
    </div>
  );
}
