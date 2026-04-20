import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function UserDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  if (!currentUser) {
    return (
      <div className="page-container">
        <p>You are not signed in. <Link to="/login">Sign in</Link></p>
      </div>
    );
  }

  const roleLabel = {
    professor: "Professor",
    student:   "Student",
    alumni:    "Alumni"
  }[currentUser.role] || currentUser.role;

  return (
    <div className="page-container" style={{ maxWidth: 600 }}>
      <h1 className="page-title">My Account</h1>

      <div className="professor-card" style={{ marginBottom: "1.5rem" }}>
        <p style={{ margin: "0 0 0.25rem", fontSize: "0.82rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Signed in as
        </p>
        <p style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600, color: "#0a2a43" }}>
          {currentUser.email}
        </p>
        <span style={{
          display: "inline-block", marginTop: "0.5rem",
          fontSize: "0.78rem", fontWeight: 600,
          padding: "0.25rem 0.65rem", borderRadius: 12,
          background: currentUser.role === "professor" ? "#e0f2fe" : "#f0fdf4",
          color:      currentUser.role === "professor" ? "#0369a1" : "#15803d",
          border:     `1px solid ${currentUser.role === "professor" ? "#bae6fd" : "#bbf7d0"}`
        }}>
          {roleLabel}
        </span>
      </div>

      {currentUser.role === "professor" && currentUser.professor_name && (
        <div className="professor-card" style={{ marginBottom: "1.5rem" }}>
          <p style={{ margin: "0 0 0.5rem", fontSize: "0.82rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Your Profile
          </p>
          <p style={{ margin: "0 0 0.75rem", color: "#334155" }}>
            {currentUser.professor_name}
          </p>
          <Link
            to={`/professors/${encodeURIComponent(currentUser.professor_name)}`}
            style={{
              display: "inline-block", padding: "0.4rem 0.9rem",
              background: "#0a4a8a", color: "white", textDecoration: "none",
              borderRadius: 6, fontSize: "0.85rem", fontWeight: 600, marginRight: "0.5rem"
            }}
          >
            View Profile
          </Link>
          <Link
            to={`/professors/${encodeURIComponent(currentUser.professor_name)}/edit`}
            style={{
              display: "inline-block", padding: "0.4rem 0.9rem",
              background: "#f0f4ff", color: "#0a4a8a",
              border: "1px solid #c7d7f5", textDecoration: "none",
              borderRadius: 6, fontSize: "0.85rem", fontWeight: 600
            }}
          >
            Edit Profile
          </Link>
        </div>
      )}

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <Link to="/" style={{ color: "#0a4a8a", fontSize: "0.9rem" }}>← Back to Portal</Link>
        <button
          onClick={handleLogout}
          style={{
            padding: "0.4rem 0.9rem", borderRadius: 6,
            background: "#fee2e2", color: "#dc2626",
            border: "1px solid #fecaca", cursor: "pointer",
            fontSize: "0.875rem", fontWeight: 600
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}