import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: "👩‍🏫",
    title: "Faculty Directory",
    desc: "Browse detailed profiles for every CTIS professor — their background, research interests, courses taught, and contact info. Professors can log in and keep their own profiles up to date.",
  },
  {
    icon: "📚",
    title: "Course Catalog",
    desc: "Every CTIS course in one place. See credits, descriptions, prerequisites, and which degree programs each course satisfies.",
  },
  {
    icon: "🎓",
    title: "Degree Audit",
    desc: "Enter the courses you've completed and instantly see what requirements you've satisfied and what's still left for your chosen program.",
  },
  {
    icon: "✅",
    title: "Course Eligibility Checker",
    desc: "Not sure if you've met the prerequisites for a course? Check before you register and avoid surprises at advising.",
  },
  {
    icon: "🗓️",
    title: "Course Planner",
    desc: "Plan your remaining semesters and get a suggested course sequence that keeps you on track for graduation.",
  },
  {
    icon: "📊",
    title: "Distinct Credits Calculator",
    desc: "Thinking about a double major or adding a minor? This tool shows exactly how many credits overlap versus count distinctly toward each program.",
  },
  {
    icon: "🤖",
    title: "AI Academic Advisor",
    desc: "An AI assistant trained on CTIS program data. Ask it anything — degree paths, course questions, scheduling strategy — and get instant, personalized guidance.",
  },
];

const CreatedBy = [
   { name: "Lucas Wheeler (26)", role: "CTIS/CNS Double Major"}
  
];

export default function AboutPage() {
  return (
    <div>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #0a1f35 0%, #0a3a6b 100%)",
        color: "white",
        padding: "4rem 2rem",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🖥️</div>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 800, margin: "0 0 1rem" }}>
            Guilford CTIS Academic Portal
          </h1>
          <p style={{ fontSize: "1.15rem", color: "#93c5fd", lineHeight: 1.7, margin: 0 }}>
            A student-built academic planning platform for the Computing & Technology in Society
            department at Guilford College.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 2rem" }}>

        {/* What is this */}
        <section style={{ marginBottom: "3.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0a2a43", marginBottom: "1rem" }}>
            What is this portal?
          </h2>
          <p style={{ color: "#4a5568", lineHeight: 1.8, fontSize: "1.025rem", marginBottom: "1rem" }}>
            The Guilford CTIS Academic Portal is a centralized, self-service platform designed to give
            CTIS students, alumni, and faculty everything they need in one place. It replaces scattered
            spreadsheets, outdated PDFs, and back-and-forth emails with a set of interactive tools that
            answer the most common academic planning questions instantly.
          </p>
          <p style={{ color: "#4a5568", lineHeight: 1.8, fontSize: "1.025rem" }}>
            Students can audit their degree progress, check course eligibility, plan future semesters,
            explore how two programs overlap, and talk to an AI advisor — all without waiting for an
            advising appointment. Faculty can maintain their own profiles directly through the portal.
            Alumni can stay connected with the department and with each other.
          </p>
        </section>

        {/* Why I built it */}
        <section style={{
          background: "#f0f7ff",
          border: "1px solid #bfdbfe",
          borderRadius: 12,
          padding: "2rem",
          marginBottom: "3.5rem",
        }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0a2a43", marginBottom: "1rem" }}>
            Why I built it
          </h2>
          <p style={{ color: "#1e3a5f", lineHeight: 1.8, fontSize: "1.025rem", marginBottom: "1rem" }}>
            This project was created as a senior capstone by CTIS students as a practical solution to a
            real problem: navigating degree requirements in a small, specialized department is harder than
            it should be. Advising slots are limited, requirements span multiple catalogs, and double
            majors or minor combinations require careful credit tracking that no existing tool handled well.
          </p>
          <p style={{ color: "#1e3a5f", lineHeight: 1.8, fontSize: "1.025rem" }}>
            I wanted to build something that would outlast our time at Guilford — a tool the department
            could actually use and maintain after we graduate.
          </p>
          <p style={{ color: "#1e3a5f", lineHeight: 1.8, fontSize: "1.025rem" }}>
           Too many students have little to no knowledge of what classes are offered, how to plan out their semesters accordingly, or even realize they can have a minor/second major just by taking a couple of extra classes. This portal is supposed to bridge the gap, and help students have full awareness of classes, requirents, expectations, connections, and more.
          </p>
        </section>

        {/* Features grid */}
        <section style={{ marginBottom: "3.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0a2a43", marginBottom: "1.5rem" }}>
            What's included
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1.25rem",
          }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: "1.25rem",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.6rem" }}>{f.icon}</div>
                <div style={{ fontWeight: 700, color: "#0a2a43", marginBottom: "0.4rem" }}>{f.title}</div>
                <div style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Who can use it */}
        <section style={{ marginBottom: "3.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0a2a43", marginBottom: "1rem" }}>
            Who can use it
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
            {[
              { icon: "👤", role: "Current Students", desc: "Self-register to access all planning tools and track your personal degree progress." },
              { icon: "🧑‍🎓",   role: "Alumni",           desc: "Create an alumni account to stay connected, share your LinkedIn, and be listed in the alumni directory." },
              { icon: "👩‍🏫", role: "Professors",       desc: "Log in with your department-issued account to update and manage your own faculty profile." },
            ].map(u => (
              <div key={u.role} style={{
                background: "white", border: "1px solid #e2e8f0",
                borderRadius: 10, padding: "1.5rem", textAlign: "center",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{u.icon}</div>
                <div style={{ fontWeight: 700, color: "#0a2a43", marginBottom: "0.4rem" }}>{u.role}</div>
                <div style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.6 }}>{u.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Tech stack */}
        <section style={{ marginBottom: "3.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0a2a43", marginBottom: "1rem" }}>
            Built with
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem" }}>
            {[
              "React", "AWS Lambda", "API Gateway", "Amazon RDS (PostgreSQL)",
              "Amazon Cognito", "Amazon Bedrock (AI)", "Terraform", "Node.js", 
            ].map(t => (
              <span key={t} style={{
                background: "#0a1f35", color: "#93c5fd",
                padding: "0.35rem 0.85rem", borderRadius: 20,
                fontSize: "0.85rem", fontWeight: 500,
              }}>
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* Team */}
        <section style={{ marginBottom: "3.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0a2a43", marginBottom: "1rem" }}>
            Created By:
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
           { CreatedBy.map(m => (
              <div key={m.name} style={{
                background: "white", border: "1px solid #e2e8f0",
                borderRadius: 10, padding: "1.25rem 1.5rem",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)", minWidth: 200,
              }}>
                <div style={{ fontWeight: 700, color: "#0a2a43" }}>{m.name}</div>
                <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.2rem" }}>{m.role}</div>
              </div>
            ))}
          </div>
        </section>

{/* Additional Resources */}
<section style={{ marginBottom: "3.5rem" }}>
  <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0a2a43", marginBottom: "1rem" }}>
    Additional Resources
  </h2>
  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
    <a
      href="https://cnscsap--cybersecawareness-9dafb.us-east4.hosted.app/"
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none" }}
    >
      <div style={{
        background: "white", border: "1px solid #e2e8f0",
        borderRadius: 10, padding: "1.25rem 1.5rem",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        display: "flex", alignItems: "center", gap: "1rem",
        transition: "border-color 0.15s",
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "#93c5fd"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
      >
        <div style={{ fontSize: "2rem" }}>🔐</div>
        <div>
          <div style={{ fontWeight: 700, color: "#0a2a43", marginBottom: "0.2rem" }}>
            CNS Cybersecurity Awareness Portal
          </div>
          <div style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.6 }}>
            A cybersecurity awareness resource built by fellow Guilford CNS students.
            Learn best practices, explore security concepts, and stay informed on modern threats.
          </div>
          <div style={{ color: "#1d4ed8", fontSize: "0.8rem", marginTop: "0.35rem", fontWeight: 500 }}>
            cnscsap--cybersecawareness-9dafb.us-east4.hosted.app ↗
          </div>
        </div>
      </div>
    </a>
  </div>
</section>

        {/* CTA */}
        <section style={{
          background: "linear-gradient(135deg, #0a1f35 0%, #0a3a6b 100%)",
          borderRadius: 12, padding: "2.5rem 2rem", textAlign: "center", color: "white",
        }}>
          <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.4rem", fontWeight: 700 }}>
            Ready to get started?
          </h2>
          <p style={{ color: "#93c5fd", marginBottom: "1.5rem", fontSize: "1rem" }}>
            Create a free account to save your course history and access all planning tools.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/signup" style={{
              background: "#1d4ed8", color: "white", textDecoration: "none",
              padding: "0.65rem 1.5rem", borderRadius: 8, fontWeight: 600, fontSize: "0.95rem",
            }}>
              Create Account
            </Link>
            <Link to="/" style={{
              background: "rgba(255,255,255,0.1)", color: "white", textDecoration: "none",
              padding: "0.65rem 1.5rem", borderRadius: 8, fontWeight: 600, fontSize: "0.95rem",
              border: "1px solid rgba(255,255,255,0.2)",
            }}>
              Explore the Portal
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}