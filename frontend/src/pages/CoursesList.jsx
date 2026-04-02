import { useEffect, useState } from "react";
import { getCourses } from "../api";
import { Link, useLocation } from "react-router-dom";

export default function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // ⭐ NEW: read ?open=COURSE_ID from URL
  const location = useLocation();
  const openCourseId = new URLSearchParams(location.search).get("open");

  // ⭐ NEW: expanded state pre‑opens the target course
  const [expanded, setExpanded] = useState(
    openCourseId ? { [openCourseId]: true } : {}
  );

  useEffect(() => {
    async function load() {
      try {
        const data = await getCourses();
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // ⭐ NEW: scroll to the opened course after loading
  useEffect(() => {
    if (!loading && openCourseId) {
      const el = document.getElementById(`course-${openCourseId}`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      }
    }
  }, [loading, openCourseId]);

  function toggleExpand(courseId) {
    setExpanded((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  }

  if (loading) {
    return <p style={{ padding: 20 }}>Loading courses…</p>;
  }

  if (error) {
    return (
      <p style={{ padding: 20, color: "red" }}>
        Error loading courses: {error}
      </p>
    );
  }

  // Filter by search
  const filtered = courses.filter((c) => {
    const text = `${c.course_id} ${c.title} ${c.description}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  // Split into core + electives
  const coreCourses = filtered.filter((c) => c.is_core);
  const electiveCourses = filtered.filter((c) => !c.is_core);

  const renderCourseCard = (course) => {
    const prereqs = Array.isArray(course.prerequisites)
      ? course.prerequisites
      : [];

    const cross = Array.isArray(course.cross_listed)
      ? course.cross_listed
      : [];

    const isCore = course.is_core;

    // Format core_for nicely and remove duplicates
    const formattedCoreFor = (() => {
      if (!course.core_for) return [];

      let labels = course.core_for.map((d) =>
        d
          .replace("_MAJOR", " Major")
          .replace("_MINOR", " Minor")
          .replace(/\bCTIS\b/, "CTIS")
          .replace(/\bCNS\b/, "CNS")
      );

      labels = [...new Set(labels)];

      const clean = [];

      const hasCTISMajor = labels.includes("CTIS Major");
      const hasCTISMinor = labels.includes("CTIS Minor");
      const hasCTIS = labels.includes("CTIS");

      const hasCNSMajor = labels.includes("CNS Major");
      const hasCNSMinor = labels.includes("CNS Minor");
      const hasCNS = labels.includes("CNS");

      if (hasCTISMajor) clean.push("CTIS Major");
      if (hasCTISMinor) clean.push("CTIS Minor");
      if (!hasCTISMajor && !hasCTISMinor && hasCTIS) clean.push("CTIS");

      if (hasCNSMajor) clean.push("CNS Major");
      if (hasCNSMinor) clean.push("CNS Minor");
      if (!hasCNSMajor && !hasCNSMinor && hasCNS) clean.push("CNS");

      return clean;
    })();

    return (
      <div
        key={course.course_id}
        id={`course-${course.course_id}`}   // ⭐ NEW: scroll target
        style={{
          borderRadius: 8,
          padding: "1rem",
          marginBottom: "1rem",
          background: "#ffffff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          borderLeft: `6px solid ${isCore ? "#1a4dbf" : "#0f7a3a"}`,
          transition: "transform 0.15s ease",
        }}
      >
        <div
          onClick={() => toggleExpand(course.course_id)}
          style={{
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0 }}>
            {course.course_id} — {course.title}
          </h3>
          <span style={{ fontSize: "1.5rem", color: "#555" }}>
            {expanded[course.course_id] ? "▲" : "▼"}
          </span>
        </div>

        {expanded[course.course_id] && (
          <div style={{ marginTop: "1rem", color: "#333" }}>
            <p>{course.description}</p>

            <p>
              <strong>Credits:</strong> {course.credits}
            </p>

            {formattedCoreFor.length > 0 && (
              <p>
                <strong>Core For:</strong>{" "}
                {formattedCoreFor.join(" & ")}
              </p>
            )}

            {prereqs.length > 0 && (
              <p>
                <strong>Prerequisites:</strong> {prereqs.join(", ")}
              </p>
            )}

            {cross.length > 0 && (
              <p>
                <strong>Cross‑listed:</strong> {cross.join(", ")}
              </p>
            )}

            <p>
              <strong>Term Offered:</strong> {course.term_offered}
            </p>

            <p>
              <strong>Usual Professor:</strong> {course.professor}
            </p>

            <p>
              <strong>Usual Location:</strong> {course.location}
            </p>

            <p>
              <strong>Level:</strong> {course.level}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: "2.2rem", marginBottom: "1rem" }}>
        Course Catalog
      </h1>

      <Link to="/" style={{ display: "block", marginBottom: "1rem", fontSize: "1rem" }}>
        ← Back to Home
      </Link>

      {/* Page Description */}
      <div
        style={{
          background: "#f0f4ff",
          padding: "1.2rem",
          borderRadius: "8px",
          marginBottom: "1.8rem",
          border: "1px solid #c7d7ff",
          lineHeight: 1.55,
        }}
      >
       <p style={{ margin: 0 }}>
          This catalog lists all courses offered within the CTIS Department,
          including both the Computer Technology & Information Systems major and
          the Cyber & Network Security major. Courses are grouped into two
          categories:
          <br /><br />

          <span style={{ color: "#1a4dbf", fontWeight: "600" }}>
            Core Courses
          </span>{" "}
          — These fulfill required components for at least one CTIS or CNS
          program, including foundational classes, core requirements,
          internships, minor requirements, and capstone requirements.
          <br /><br />

          <span style={{ color: "#0f7a3a", fontWeight: "600" }}>
            Strict Electives
          </span>{" "}
          — These include all other CTIS‑prefix courses that are not required,
          as well as any cross‑listed courses that may count toward elective
          credit for at least one of the two majors.
        </p>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search courses..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "0.75rem",
          marginBottom: "1.5rem",
          fontSize: "1rem",
          borderRadius: 6,
          border: "1px solid #ccc",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      />

      {/* CORE COURSES */}
      <h2 style={{ marginTop: "2rem", color: "#1a4dbf" }}>Core Courses</h2>
      {coreCourses.length === 0 && <p>No core courses match your search.</p>}
      {coreCourses.map(renderCourseCard)}

      {/* ELECTIVES */}
      <h2 style={{ marginTop: "2rem", color: "#0f7a3a" }}>Strict Electives</h2>
      {electiveCourses.length === 0 && (
        <p>No elective courses match your search.</p>
      )}
      {electiveCourses.map(renderCourseCard)}
    </div>
  );
}