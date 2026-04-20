import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container" style={{ maxWidth: 440 }}>
      <h1 className="page-title">Sign In</h1>
      <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
        Guilford CTIS Academic Portal
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="you@guilford.edu"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={inputStyle}
          />
        </div>

        {error && <p style={{ color: "#dc2626", fontSize: "0.875rem", marginBottom: "1rem" }}>{error}</p>}

        <button type="submit" disabled={loading} style={btnStyle(loading)}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p style={{ marginTop: "1.25rem", fontSize: "0.875rem", color: "#64748b" }}>
        Don't have an account?{" "}
        <Link to="/signup" style={{ color: "#0a4a8a" }}>Sign up</Link>
      </p>
      <p style={{ marginTop: "0.5rem" }}>
        <Link to="/" style={{ color: "#94a3b8", fontSize: "0.85rem" }}>← Back to Portal</Link>
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