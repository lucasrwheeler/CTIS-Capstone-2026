import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ConfirmPage() {
  const { confirmSignup } = useAuth();
  const navigate          = useNavigate();
  const [searchParams]    = useSearchParams();

  const [email, setEmail]   = useState(searchParams.get("email") || "");
  const [code, setCode]     = useState("");
  const [error, setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await confirmSignup(email, code);
      navigate("/login?confirmed=1");
    } catch (err) {
      setError(err.message || "Confirmation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container" style={{ maxWidth: 440 }}>
      <h1 className="page-title">Verify Your Email</h1>
      <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
        We sent a 6-digit code to your email. Enter it below.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            required style={inputStyle} />
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <label style={labelStyle}>Confirmation Code</label>
          <input type="text" value={code} onChange={e => setCode(e.target.value)}
            required placeholder="123456" style={{ ...inputStyle, fontSize: "1.2rem", letterSpacing: "0.2em" }} />
        </div>

        {error && <p style={{ color: "#dc2626", fontSize: "0.875rem", marginBottom: "1rem" }}>{error}</p>}

        <button type="submit" disabled={loading} style={btnStyle(loading)}>
          {loading ? "Verifying…" : "Verify Email"}
        </button>
      </form>

      <p style={{ marginTop: "1rem" }}>
        <Link to="/login" style={{ color: "#94a3b8", fontSize: "0.85rem" }}>← Back to Sign In</Link>
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