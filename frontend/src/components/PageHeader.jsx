export default function PageHeader({ icon, title, description }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #0a1f35 0%, #0a3a6b 100%)",
      color: "white",
      padding: "2.5rem 2rem",
      marginBottom: "2rem",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ fontSize: "2.25rem", marginBottom: "0.5rem" }}>{icon}</div>
        <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700 }}>{title}</h1>
        <p style={{ margin: "0.5rem 0 0", color: "#93c5fd", fontSize: "1rem", maxWidth: 600 }}>
          {description}
        </p>
      </div>
    </div>
  );
}