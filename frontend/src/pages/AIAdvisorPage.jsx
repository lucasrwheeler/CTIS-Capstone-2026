import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCourses, getAIAdvice } from "../api";



const DEGREES = [
  { value: "",          label: "Not specified" },
  { value: "CTIS_MAJOR", label: "CTIS Major" },
  { value: "CNS_MAJOR",  label: "CNS Major (Cybersecurity)" },
  { value: "CTIS_MINOR", label: "CTIS Minor" },
  { value: "CNS_MINOR",  label: "CNS Minor" },
];

const SUGGESTED = [
  "What should I take next semester?",
  "What do I need to know before taking CTIS 440?",
  "How do the CTIS Major and CNS Major overlap?",
  "Which courses are only offered in the Fall?",
  "What are the prerequisites for CTIS 342?",
  "Can you summarize what CTIS 321 covers?",
];

export default function AIAdvisorPage() {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [degree, setDegree]       = useState("");
  const [completed, setCompleted] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [showCourses, setShowCourses] = useState(false);
  const [loading, setLoading]     = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    getCourses().then(d => setAllCourses(d || [])).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function toggleCourse(id) {
    setCompleted(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }

  async function send(question) {
    const q = (question || input).trim();
    if (!q || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setLoading(true);

    try {
      const data = await getAIAdvice(q, degree, completed);
      const answer = data.answer || data.error || "No response received.";
      setMessages(prev => [...prev, { role: "advisor", text: answer }]);
    } catch {
      setMessages(prev => [...prev, { role: "advisor", text: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (

    
    
    <div className="page-container" style={{ maxWidth: 800 }}>
      <Link to="/" style={{ color: "#0a4a8a", textDecoration: "none", fontSize: "0.9rem" }}>
        ← Back to Home
      </Link>



      <h1 className="page-title" style={{ marginTop: "1rem" }}>AI Academic Advisor</h1>
      <p style={{ color: "#4a5568", marginBottom: "1.5rem" }}>
        Ask anything about CTIS and CNS courses, requirements, prerequisites, or planning your degree. Powered by Amazon Bedrock.
      </p>

      {/* Context panel */}
      <div className="professor-card" style={{ marginBottom: "1.5rem", borderLeft: "4px solid #0a4a8a" }}>
        <p style={{ margin: "0 0 0.75rem", fontWeight: 600, color: "#0a2a43", fontSize: "0.9rem" }}>
          Optional: Give the advisor your context for more personalized answers
        </p>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#64748b", marginBottom: "0.25rem" }}>
              Your Degree
            </label>
            <select
              value={degree}
              onChange={e => setDegree(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: 6, border: "1px solid #ccc", fontSize: "0.9rem" }}
            >
              {DEGREES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>

          <button
            onClick={() => setShowCourses(v => !v)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: 6,
              border: "1px solid #c7d7f5",
              background: "#f0f4ff",
              color: "#0a4a8a",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {showCourses ? "Hide" : "Add"} Completed Courses
            {completed.length > 0 && (
              <span style={{ marginLeft: "0.4rem", background: "#0a4a8a", color: "white", borderRadius: 10, padding: "0.1rem 0.4rem", fontSize: "0.75rem" }}>
                {completed.length}
              </span>
            )}
          </button>
        </div>

        {showCourses && (
          <div style={{ marginTop: "0.75rem", maxHeight: 180, overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: 6, padding: "0.5rem" }}>
            {allCourses.map(c => (
              <label key={c.course_id} style={{ display: "block", fontSize: "0.85rem", padding: "0.15rem 0" }}>
                <input
                  type="checkbox"
                  checked={completed.includes(c.course_id)}
                  onChange={() => toggleCourse(c.course_id)}
                  style={{ marginRight: "0.4rem" }}
                />
                {c.course_id} — {c.title}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Suggested questions */}
      {messages.length === 0 && (
        <div style={{ marginBottom: "1.25rem" }}>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "0.5rem" }}>Try asking:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {SUGGESTED.map(q => (
              <button
                key={q}
                onClick={() => send(q)}
                style={{
                  padding: "0.35rem 0.75rem",
                  borderRadius: 20,
                  border: "1px solid #c7d7f5",
                  background: "#f0f4ff",
                  color: "#0a4a8a",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conversation */}
      {messages.length > 0 && (
        <div style={{ marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div style={{
                maxWidth: "80%",
                padding: "0.75rem 1rem",
                borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                background: m.role === "user" ? "#0a4a8a" : "#f8fafc",
                color: m.role === "user" ? "white" : "#1e293b",
                border: m.role === "advisor" ? "1px solid #e2e8f0" : "none",
                fontSize: "0.9rem",
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
              }}>
                {m.role === "advisor" && (
                  <p style={{ margin: "0 0 0.35rem", fontSize: "0.72rem", fontWeight: 700, color: "#0a4a8a", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    AI Advisor
                  </p>
                )}
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{
                padding: "0.75rem 1rem",
                borderRadius: "12px 12px 12px 4px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#94a3b8",
                fontSize: "0.9rem",
              }}>
                Thinking…
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask about courses, prerequisites, degree planning…"
          rows={2}
          style={{
            flex: 1,
            padding: "0.65rem 0.9rem",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            fontSize: "0.9rem",
            resize: "none",
            lineHeight: 1.5,
          }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          style={{
            padding: "0.65rem 1.25rem",
            background: !input.trim() || loading ? "#94a3b8" : "#0a4a8a",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: !input.trim() || loading ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "…" : "Ask"}
        </button>
      </div>
      <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.4rem" }}>
        Press Enter to send · Shift+Enter for new line · Powered by Amazon Bedrock (Claude)
      </p>
    </div>
  );
}