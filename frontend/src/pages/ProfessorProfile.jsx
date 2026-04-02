import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function ProfessorProfile() {
  const { name } = useParams();
  const [professor, setProfessor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/professors/${encodeURIComponent(name)}`
        );
        const data = await res.json();
        setProfessor(data);
      } catch (err) {
        console.error("Failed to load professor:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [name]);

  if (loading) return <div className="loading">Loading professor…</div>;
  if (!professor) return <div className="error">Professor not found.</div>;

  return (
    <div className="page-container">
      <h1 className="page-title">{professor.name}</h1>

      <p><strong>Department:</strong> {professor.department}</p>
      <p><strong>Role:</strong> {professor.role}</p>

      <h2 className="section-title">Courses Taught</h2>

      {professor.courses.length === 0 ? (
        <p>This professor is not currently assigned to any courses.</p>
      ) : (
        <ul className="course-list">
          {professor.courses.map((courseId) => (
            <li key={courseId}>
              <Link to={`/courses/${courseId}`}>{courseId}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}