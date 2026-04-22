import { Routes, Route, Link, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import DegreeAuditPage   from "./pages/DegreeAuditPage";
import EligibilityPage   from "./pages/EligibilityPage";
import CoursePlannerPage from "./pages/CoursePlannerPage";
import CoursesList       from "./pages/CoursesList";
import Professors        from "./pages/Professors";
import ProfessorProfile  from "./pages/ProfessorProfile";
import DistinctCredits   from "./pages/DistinctCredits";
import AIAdvisorPage     from "./pages/AIAdvisorPage";
import ProfessorEditPage from "./pages/ProfessorEditPage";
import LoginPage         from "./pages/LoginPage";
import SignupPage        from "./pages/SignupPage";
import ConfirmPage       from "./pages/ConfirmPage";
import UserDashboard     from "./pages/UserDashboard";

const NAV_PAGES = [
  { to: "/professors",   label: "Professors",       icon: "👤", desc: "Browse faculty profiles, research interests, and contact information for CTIS department staff." },
  { to: "/courses",      label: "Courses",           icon: "📚", desc: "Explore the full CTIS course catalog including descriptions, credits, and prerequisites." },
  { to: "/degree-audit", label: "Degree Audit",      icon: "🎓", desc: "Check your progress toward your degree by entering the courses you've completed." },
  { to: "/eligibility",  label: "Eligibility",       icon: "✅", desc: "Find out if you meet the prerequisites for any course before you register." },
  { to: "/planner",      label: "Course Planner",    icon: "🗓️", desc: "Plan out your remaining semesters and get a suggested course sequence." },
  { to: "/distinct",     label: "Distinct Credits",  icon: "📊", desc: "Calculate how many distinct credits count toward a double major or minor combination." },
  { to: "/ai-advisor",   label: "AI Advisor",        icon: "🤖", desc: "Get personalized academic advice powered by AI — ask anything about your degree path." },
];

function NavLink({ to, label, icon }) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + "/");
  return (
    <Link
      to={to}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.35rem",
        color: isActive ? "#ffffff" : "#94a3b8",
        textDecoration: "none",
        fontSize: "0.875rem",
        fontWeight: isActive ? 600 : 400,
        padding: "0.6rem 0.85rem",
        borderRadius: "6px 6px 0 0",
        background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
        borderBottom: isActive ? "2px solid #3b82f6" : "2px solid transparent",
        transition: "color 0.15s, background 0.15s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "#e2e8f0"; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "#94a3b8"; }}
    >
      <span style={{ fontSize: "0.9rem" }}>{icon}</span>
      {label}
    </Link>
  );
}

function NavBar() {
  const { currentUser, logout } = useAuth();
  return (
    <div style={{
      background: "#0a1f35",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
    }}>

      {/* ── Top row: branding + auth ── */}
      <div style={{
        padding: "0 2rem",
        height: "56px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>

        {/* Logo */}
        <Link to="/" style={{
          display: "flex", alignItems: "center", gap: "0.6rem",
          color: "white", textDecoration: "none",
        }}>
          <div style={{
            background: "#1d4ed8", borderRadius: 6,
            padding: "0.35rem 0.5rem", fontSize: "1rem", lineHeight: 1,
          }}>🎓</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "0.01em", lineHeight: 1.2 }}>
              Guilford CTIS Portal
            </div>
            <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 400, letterSpacing: "0.04em" }}>
              ACADEMIC PORTAL
            </div>
          </div>
        </Link>

        {/* Auth section */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", fontSize: "0.875rem" }}>
          {currentUser ? (
            <>
              <Link to="/dashboard" style={{
                color: "#93c5fd", textDecoration: "none",
                fontSize: "0.85rem", maxWidth: 220,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {currentUser.email}
              </Link>
              <button onClick={logout} style={{
                background: "none", border: "1px solid #334155",
                color: "#94a3b8", borderRadius: 6,
                padding: "0.3rem 0.75rem", cursor: "pointer", fontSize: "0.8rem",
                transition: "border-color 0.15s, color 0.15s",
              }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                color: "#93c5fd", textDecoration: "none",
                padding: "0.3rem 0.75rem", borderRadius: 6,
                border: "1px solid rgba(147,197,253,0.25)",
                fontSize: "0.875rem",
              }}>
                Sign In
              </Link>
              <Link to="/signup" style={{
                color: "white", textDecoration: "none", background: "#1d4ed8",
                padding: "0.35rem 0.85rem", borderRadius: 6, fontSize: "0.875rem",
                fontWeight: 600,
              }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── Bottom row: page links ── */}
      <div style={{
        padding: "0 2rem",
        display: "flex",
        alignItems: "flex-end",
        gap: "0.1rem",
        overflowX: "auto",
      }}>
        {NAV_PAGES.map(p => (
          <NavLink key={p.to} to={p.to} label={p.label} icon={p.icon} />
        ))}
      </div>
    </div>
  );
}

function Home() {
  return (
    <div className="page-container">
      <h1 className="page-title">Guilford CTIS Department Academic Portal</h1>
      <p style={{ color: "#4a5568", marginBottom: "2.5rem", fontSize: "1.05rem", maxWidth: 600 }}>
        Your one-stop portal for academic planning, course information, and faculty resources in the CTIS department.
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "1.25rem",
      }}>
        {NAV_PAGES.map(p => (
          <Link key={p.to} to={p.to} style={{ textDecoration: "none" }}>
            <div className="professor-card" style={{ height: "100%", padding: "1.5rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{p.icon}</div>
              <div style={{ fontWeight: 700, color: "#0a2a43", fontSize: "1.05rem", marginBottom: "0.4rem" }}>
                {p.label}
              </div>
              <div style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.5 }}>
                {p.desc}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Catalog()         { return <h1>Course Catalog</h1>; }
function CourseDetail()    { return <h1>Course Detail</h1>; }
function ProfessorDetail() { return <h1>Professor Detail</h1>; }

export default function App() {
  return (
    <AuthProvider>
      <NavBar />
      <Routes>
        <Route path="/"                      element={<Home />} />
        <Route path="/degree-audit"          element={<DegreeAuditPage />} />
        <Route path="/eligibility"           element={<EligibilityPage />} />
        <Route path="/planner"               element={<CoursePlannerPage />} />
        <Route path="/courses"               element={<CoursesList />} />
        <Route path="/professors"            element={<Professors />} />
        <Route path="/professors/:name"      element={<ProfessorProfile />} />
        <Route path="/professors/:name/edit" element={<ProfessorEditPage />} />
        <Route path="/distinct"              element={<DistinctCredits />} />
        <Route path="/ai-advisor"            element={<AIAdvisorPage />} />
        <Route path="/login"                 element={<LoginPage />} />
        <Route path="/signup"                element={<SignupPage />} />
        <Route path="/confirm"               element={<ConfirmPage />} />
        <Route path="/dashboard"             element={<UserDashboard />} />
        <Route path="/catalog"               element={<Catalog />} />
        <Route path="/course/:id"            element={<CourseDetail />} />
        <Route path="/professor/:id"         element={<ProfessorDetail />} />
      </Routes>
    </AuthProvider>
  );
}