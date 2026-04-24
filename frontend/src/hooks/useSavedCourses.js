import { useState, useEffect } from "react";

const COURSES_KEY  = "ctis_completed_courses";
const DEGREE_KEY   = "ctis_degree_program";
const INTERN_KEY   = "ctis_intern_credits";
const PROGRAMS_KEY = "ctis_programs";

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function useSavedCourses() {
  const [completed, setCompleted]         = useState(() => readJSON(COURSES_KEY, []));
  const [degree, setDegreeState]          = useState(() => localStorage.getItem(DEGREE_KEY) || "");
  const [internCredits, setInternCreditsState] = useState(() => readJSON(INTERN_KEY, {}));
  const [programs, setProgramsState]      = useState(() => readJSON(PROGRAMS_KEY, []));

  useEffect(() => { localStorage.setItem(COURSES_KEY, JSON.stringify(completed)); }, [completed]);
  useEffect(() => { localStorage.setItem(INTERN_KEY, JSON.stringify(internCredits)); }, [internCredits]);
  useEffect(() => { localStorage.setItem(PROGRAMS_KEY, JSON.stringify(programs)); }, [programs]);

  function setDegree(d) {
    setDegreeState(d);
    localStorage.setItem(DEGREE_KEY, d);
    // keep programs in sync — d is always the primary
    if (d) setProgramsState(prev => [d, ...prev.filter(p => p !== d)]);
  }

  function toggleProgram(prog) {
    setProgramsState(prev => {
      const next = prev.includes(prog)
        ? prev.filter(p => p !== prog)
        : [...prev, prog];
      // primary degree = first program in list
      const newPrimary = next[0] || "";
      setDegreeState(newPrimary);
      localStorage.setItem(DEGREE_KEY, newPrimary);
      return next;
    });
  }

  function setPrograms(newPrograms) {
  setProgramsState(newPrograms);
  localStorage.setItem(PROGRAMS_KEY, JSON.stringify(newPrograms));
  const newPrimary = newPrograms[0] || "";
  setDegreeState(newPrimary);
  localStorage.setItem(DEGREE_KEY, newPrimary);
}

  function toggleCourse(courseId) {
    setCompleted(prev =>
      prev.includes(courseId) ? prev.filter(c => c !== courseId) : [...prev, courseId]
    );
  }

  function setInternAmount(courseId, credits) {
    const cr = parseInt(credits, 10);
    setInternCreditsState(prev => ({ ...prev, [courseId]: cr }));
    if (cr > 0) setCompleted(prev => prev.includes(courseId) ? prev : [...prev, courseId]);
    else setCompleted(prev => prev.filter(c => c !== courseId));
  }

  function removeCourse(courseId) {
    setCompleted(prev => prev.filter(c => c !== courseId));
  }

  function clearAll() {
    setCompleted([]);
    setInternCreditsState({});
    localStorage.removeItem(COURSES_KEY);
    localStorage.removeItem(INTERN_KEY);
  }

return {
  completed, degree, setDegree,
  programs, toggleProgram, setPrograms,   // ← add setPrograms here
  toggleCourse, setInternAmount, internCredits,
  removeCourse, clearAll,
};
}