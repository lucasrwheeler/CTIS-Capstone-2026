import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  { value: "student",   label: "Student" },
  { value: "alumni",    label: "Alumni" },
  { value: "professor", label: "Professor" }
];

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate   = useNavigate();

  const [form, setForm] = useState({
    email: "", password: "", confirm: "", role: "student", professor_name: ""
  });
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);

  function set(key, val) { setForm(prev => ({ ...prev, [key]: val })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm) {
      return setError("Passwords do not match.");
    }
    if (form.role === "professor" && !form.professor_name.trim()) {
      return setError("Professors must enter their name exactly as it appears in the department.");
    }
    setLoading(true);
    try {
      await signup({
        email:          form.email,
        password:       form.password,
        role:           form.role,
        professor_name: form.role === "professor" ? form.professor_name.trim() : ""
      });
      navigate(`/confirm?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setError(err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container" style={{ maxWidth: 480 }}>
      <h1 className="page-title">Create Account</h1>
      <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
        Guilford CTIS Academic Portal
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Email</label>
          <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
            required placeholder="you@guilford.edu" style={inputStyle} />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Password</label>
          <input type="password" value={form.password} onChange={e => set("password", e.target.value)}
            required placeholder="Min 8 chars, 1 number, 1 uppercase" style={inputStyle} />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Confirm Password</label>
          <input type="password" value={form.confirm} onChange={e => set("confirm", e.target.value)}
            required placeholder="••••••••" style={inputStyle} />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>I am a…</label>
          <select value={form.role} onChange={e => set("role", e.target.value)}
            style={{ ...inputStyle, background: "white" }}>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        {form.role === "professor" && (
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Your Full Name (as it appears in the department)</label>
            <input type="text" value={form.professor_name} onChange={e => set("professor_name", e.target.value)}
              placeholder="e.g. Chafic W. Bou-Saba" style={inputStyle} />
            <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "0.3rem" }}>
              This must match exactly. Contact the department if unsure.
            </p>
          </div>
        )}

        {error && <p style={{ color: "#dc2626", fontSize: "0.875rem", marginBottom: "1rem" }}>{error}</p>}

        <button type="submit" disabled={loading} style={btnStyle(loading)}>
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p style={{ marginTop: "1.25rem", fontSize: "0.875rem", color: "#64748b" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "#0a4a8a" }}>Sign in</Link>
      </p>
    </div>
  );
}

const labelStyle = {
  display: "block", fontSize: "0.82rem", fontWeight: 700,
  color: "#374151", marginBottom: "0.35rem",
  textTransform: "uppercase", letterSpacing: "0.04em"
};
const inputStyle = {
  width: "100%", padding: "0.6rem 0.8rem", borderRadius: 7,
  border: "1px solid #cbd5e1", fontSize: "0.9rem",
  fontFamily: "inherit", boxSizing: "border-box"
};
const btnStyle = (disabled) => ({
  width: "100%", padding: "0.7rem",
  background: disabled ? "#94a3b8" : "#0a4a8a",
  color: "white", border: "none", borderRadius: 7,
  fontWeight: 700, fontSize: "0.95rem",
  cursor: disabled ? "not-allowed" : "pointer"
});