import { useEffect, useState } from "react";
import { getCourses } from "../api";

export default function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

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

  return (
    <div style={{ padding: 20 }}>
      <h2>Available Courses</h2>
      <ul>
        {courses.map((course) => (
          <li key={course}>{course}</li>
        ))}
      </ul>
    </div>
  );
}