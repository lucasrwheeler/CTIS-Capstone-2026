import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getProfessorProfile, updateProfessorProfile } from "../api";
import { useAuth } from "../context/AuthContext";

const FIELD_CONFIG = [
  { key: "bio",                label: "Bio / About",        type: "textarea", rows: 5,
    placeholder: "A brief description of your background, teaching philosophy, and interests." },
  { key: "email",              label: "Email",              type: "text",
    placeholder: "yourname@guilford.edu" },
  { key: "office",             label: "Office Location",    type: "text",
    placeholder: "e.g. Dana Hall 201" },
  { key: "office_hours",       label: "Office Hours",       type: "textarea", rows: 3,
    placeholder: "e.g. Mon & Wed 2–4pm, or by appointment" },
  { key: "website",            label: "Website / LinkedIn", type: "text",
    placeholder: "https://..." },
  { key: "research_interests", label: "Research Interests", type: "textarea", rows: 3,
    placeholder: "e.g. Cybersecurity, Database Systems, UX Design" },
];

export default function ProfessorEditPage() {
  const { name: nameParam } = useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(nameParam || "");

  const { currentUser, idToken } = useAuth();
   const [form, setForm]       = useState({ bio: "", email: "", office: "", office_hours: "", website: "", research_interests: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState(null);

   const canEdit = currentUser?.role === "professor" && currentUser?.professor_name === name;

  useEffect(() => {
    async function load() {
      try {
       const prof = await getProfessorProfile(name);
        if (prof) {
          setForm({
            bio:                prof.bio                || "",
            email:              prof.email              || "",
            office:             prof.office             || "",
            office_hours:       prof.office_hours       || "",
            website:            prof.website            || "",
            research_interests: prof.research_interests || "",
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [name]);

  function handleChange(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const result = await updateProfessorProfile(name, form, idToken);
      if (result?.error) throw new Error(result.error);
      setSaved(true);
      setTimeout(() => navigate(`/professors/${encodeURIComponent(name)}`), 1200);
    } catch (err) {
      setError(err.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="page-container"><p style={{ color: "#718096", marginTop: "2rem" }}>Loading…</p></div>;
  }
  if (!currentUser) {
    return (
      <div className="page-container">
     <Link to="/professors" style={{ color: "#0a4a8a", textDecoration: "none", fontSize: "0.9rem" }}>← Back to Professors</Link>
        <p style={{ color: "#334155", marginTop: "2rem" }}>
          You must <Link to="/login" style={{ color: "#0a4a8a" }}>sign in</Link> to edit a profile.
        </p>
      </div>
    );
  }

 if (!canEdit) {
    return (
      <div className="page-container">
        <Link to={`/professors/${encodeURIComponent(name)}`} style={{ color: "#0a4a8a", textDecoration: "none", fontSize: "0.9rem" }}>← Back to Profile</Link>
        <p style={{ color: "#dc2626", marginTop: "2rem" }}>You can only edit your own profile.</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 680 }}>
      <Link to={`/professors/${encodeURIComponent(name)}`}
        style={{ color: "#0a4a8a", textDecoration: "none", fontSize: "0.9rem" }}>
        ← Back to Profile
      </Link>

      <h1 className="page-title" style={{ marginTop: "1rem" }}>Edit Profile</h1>
      <p style={{ color: "#64748b", marginBottom: "1.75rem", fontSize: "0.9rem" }}>
        Editing profile for <strong>{name}</strong>. Changes are saved to the department portal.
      </p>

      <form onSubmit={handleSave}>
        {FIELD_CONFIG.map(({ key, label, type, rows, placeholder }) => (
          <div key={key} style={{ marginBottom: "1.25rem" }}>
            <label style={{
           display: "block", fontSize: "0.82rem", fontWeight: 700,
              color: "#374151", marginBottom: "0.35rem",
              textTransform: "uppercase", letterSpacing: "0.04em",
            }}>
              {label}
            </label>
            {type === "textarea" ? (
               <textarea value={form[key]} onChange={e => handleChange(key, e.target.value)}
                placeholder={placeholder} rows={rows}
                style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: 7, border: "1px solid #cbd5e1", fontSize: "0.9rem", lineHeight: 1.55, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            ) : (
              <input type="text" value={form[key]} onChange={e => handleChange(key, e.target.value)}
                placeholder={placeholder}
                         style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: 7, border: "1px solid #cbd5e1", fontSize: "0.9rem", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            )}
          </div>
        ))}

        {error && <p style={{ color: "#dc2626", fontSize: "0.875rem", marginBottom: "1rem" }}>{error}</p>}
        {saved  && <p style={{ color: "#16a34a", fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem" }}>✓ Profile saved! Redirecting…</p>}

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
           <button type="submit" disabled={saving}
            style={{ padding: "0.65rem 1.5rem", background: saving ? "#94a3b8" : "#0a4a8a", color: "white", border: "none", borderRadius: 7, fontWeight: 700, fontSize: "0.95rem", cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Saving…" : "Save Profile"}
          </button>
 <Link to={`/professors/${encodeURIComponent(name)}`} style={{ color: "#64748b", textDecoration: "none", fontSize: "0.9rem" }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}