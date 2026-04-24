import { useState } from "react";

const CARD = {
  background: "white", border: "1px solid #e2e8f0",
  borderRadius: 10, padding: "1.5rem",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};

const MOCK_ALUMNI = [
  { name: "Sarah Mitchell", year: 2022, role: "Security Analyst", company: "Cisco", linkedin: "#", degree: "CNS Major" },
  { name: "James Okafor", year: 2021, role: "Full Stack Developer", company: "Red Hat", linkedin: "#", degree: "CTIS Major" },
  { name: "Priya Sharma", year: 2023, role: "IT Project Manager", company: "Deloitte", linkedin: "#", degree: "CTIS Major" },
  { name: "Marcus Webb", year: 2020, role: "Network Engineer", company: "Verizon", linkedin: "#", degree: "CNS Major" },
];

export default function AlumniPage() {
  const [form, setForm] = useState({ name: "", year: "", role: "", company: "", linkedin: "", email: "", degree: "", bio: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    setSubmitted(true);
    setSubmitting(false);
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ background: "linear-gradient(135deg, #0a1f35 0%, #065f46 100%)", color: "white", padding: "2.5rem 2rem" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ fontSize: "2.25rem", marginBottom: "0.5rem" }}>🎓</div>
          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700 }}>CTIS Alumni Network</h1>
          <p style={{ margin: "0.5rem 0 0", color: "#6ee7b7", fontSize: "1rem" }}>
            Connect with graduates, explore career paths, and stay part of the Guilford CTIS community.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "2rem" }}>

        {/* Alumni directory */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ margin: "0 0 0.4rem", fontSize: "1.1rem", fontWeight: 700, color: "#0a2a43" }}>Alumni Directory</h2>
          <p style={{ margin: "0 0 1.5rem", color: "#64748b", fontSize: "0.875rem" }}>
            CTIS graduates making an impact across the industry.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
            {MOCK_ALUMNI.map((a, i) => (
              <div key={i} style={{ ...CARD, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: `hsl(${i * 60 + 200}, 60%, 88%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.1rem", fontWeight: 700, color: `hsl(${i * 60 + 200}, 50%, 30%)`,
                  marginBottom: "0.5rem",
                }}>
                  {a.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div style={{ fontWeight: 700, color: "#0a2a43", fontSize: "0.95rem" }}>{a.name}</div>
                <div style={{ fontSize: "0.82rem", color: "#64748b" }}>{a.role} · {a.company}</div>
                <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Class of {a.year} · {a.degree}</div>
                <a href={a.linkedin} target="_blank" rel="noreferrer" style={{
                  marginTop: "0.5rem", fontSize: "0.8rem", fontWeight: 600,
                  color: "#0077b5", textDecoration: "none",
                }}>
                  LinkedIn Profile →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Submission form */}
        <div style={CARD}>
          <h2 style={{ margin: "0 0 0.4rem", fontSize: "1.1rem", fontWeight: 700, color: "#0a2a43" }}>
            Add Your Profile
          </h2>
          <p style={{ margin: "0 0 1.5rem", color: "#64748b", fontSize: "0.875rem" }}>
            Are you a CTIS graduate? Submit your info to appear in the alumni directory.
          </p>

          {submitted ? (
            <div style={{
              background: "#f0fdf4", border: "1px solid #86efac",
              borderRadius: 8, padding: "1.25rem",
              display: "flex", alignItems: "center", gap: "0.85rem",
            }}>
              <span style={{ fontSize: "1.5rem" }}>✅</span>
              <div>
                <div style={{ fontWeight: 700, color: "#166534" }}>Profile submitted!</div>
                <div style={{ fontSize: "0.875rem", color: "#166534", marginTop: "0.2rem" }}>
                  Your information will be reviewed and added to the directory.
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>

                {[
                  { label: "Full Name *", name: "name", placeholder: "Jane Smith", required: true },
                  { label: "Graduation Year *", name: "year", placeholder: "2022", required: true },
                  { label: "Current Job Title *", name: "role", placeholder: "Software Engineer", required: true },
                  { label: "Company / Organization", name: "company", placeholder: "Google", required: false },
                  { label: "LinkedIn URL", name: "linkedin", placeholder: "https://linkedin.com/in/...", required: false },
                  { label: "Contact Email", name: "email", placeholder: "jane@example.com", required: false },
                ].map(field => (
                  <div key={field.name}>
                    <label style={{ display: "block", fontWeight: 600, color: "#0a2a43", marginBottom: "0.4rem", fontSize: "0.8rem" }}>
                      {field.label}
                    </label>
                    <input
                      type="text" name={field.name} value={form[field.name]}
                      onChange={handleChange} placeholder={field.placeholder}
                      required={field.required}
                      style={{
                        width: "100%", padding: "0.6rem 0.75rem",
                        border: "1.5px solid #e2e8f0", borderRadius: 7,
                        fontSize: "0.9rem", boxSizing: "border-box", outline: "none",
                      }}
                    />
                  </div>
                ))}

                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "#0a2a43", marginBottom: "0.4rem", fontSize: "0.8rem" }}>
                    Degree Program *
                  </label>
                  <select name="degree" value={form.degree} onChange={handleChange} required style={{
                    width: "100%", padding: "0.65rem 0.75rem", borderRadius: 7,
                    border: "1.5px solid #e2e8f0", fontSize: "0.9rem", background: "white", boxSizing: "border-box",
                  }}>
                    <option value="">— Select —</option>
                    <option value="CTIS Major">CTIS Major</option>
                    <option value="CTIS Minor">CTIS Minor</option>
                    <option value="CNS Major">Cybersecurity Major</option>
                    <option value="CNS Minor">Cybersecurity Minor</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <label style={{ display: "block", fontWeight: 600, color: "#0a2a43", marginBottom: "0.4rem", fontSize: "0.8rem" }}>
                  Short Bio / Career Note
                </label>
                <textarea
                  name="bio" value={form.bio} onChange={handleChange}
                  placeholder="Brief note about your career path or advice for current students..."
                  rows={3}
                  style={{
                    width: "100%", padding: "0.6rem 0.75rem",
                    border: "1.5px solid #e2e8f0", borderRadius: 7,
                    fontSize: "0.9rem", resize: "vertical", boxSizing: "border-box",
                    fontFamily: "inherit", outline: "none",
                  }}
                />
              </div>

              <button type="submit" disabled={submitting} style={{
                marginTop: "1.25rem",
                padding: "0.75rem 2rem",
                background: submitting ? "#94a3b8" : "#065f46",
                color: "white", border: "none", borderRadius: 8,
                fontWeight: 700, fontSize: "0.95rem",
                cursor: submitting ? "not-allowed" : "pointer",
              }}>
                {submitting ? "Submitting…" : "Submit My Profile"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}