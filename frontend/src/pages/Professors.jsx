import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProfessors } from "../api";


export default function Professors() {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProfessors();
        setProfessors(data);
      } catch (err) {
        console.error("Failed to load professors:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Loading professors…</div>;

  return (
    <div className="page-container">
      <h1 className="page-title">Professors Directory</h1>

      <div className="professor-list">
        {professors.map((p) => (
          <div key={p.name} className="professor-card">
            <Link to={`/professors/${encodeURIComponent(p.name)}`} className="professor-name">
              {p.name}
            </Link>

            <p><strong>Department:</strong> {p.department}</p>
            <p><strong>Role:</strong> {p.role}</p>
            <p><strong>Courses:</strong> {p.courses.length}</p>
          </div>
        ))}
      </div>
    </div>
  );
}