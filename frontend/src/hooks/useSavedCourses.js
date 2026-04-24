import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserProgress, saveUserProgress } from "../api";

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
  const { currentUser, idToken } = useAuth();

  const [completed,     setCompleted]          = useState(() => readJSON(COURSES_KEY, []));
  const [degree,        setDegreeState]         = useState(() => localStorage.getItem(DEGREE_KEY) || "");
  const [internCredits, setInternCreditsState]  = useState(() => readJSON(INTERN_KEY, {}));
  const [programs,      setProgramsState]       = useState(() => readJSON(PROGRAMS_KEY, []));
  const [synced,        setSynced]              = useState(false);

  // Keep localStorage in sync on every state change
  useEffect(() => { localStorage.setItem(COURSES_KEY,  JSON.stringify(completed));     }, [completed]);
  useEffect(() => { localStorage.setItem(INTERN_KEY,   JSON.stringify(internCredits)); }, [internCredits]);
  useEffect(() => { localStorage.setItem(PROGRAMS_KEY, JSON.stringify(programs));      }, [programs]);

  // On login: load from API and hydrate state (API wins over localStorage)
  useEffect(() => {
    if (!currentUser || !idToken || synced) return;
    getUserProgress(idToken)
      .then(data => {
        if (data.courses?.length > 0) {
          setCompleted(data.courses);
          localStorage.setItem(COURSES_KEY, JSON.stringify(data.courses));
        }
        if (data.programs?.length > 0) {
          setProgramsState(data.programs);
          localStorage.setItem(PROGRAMS_KEY, JSON.stringify(data.programs));
          const primary = data.programs[0] || "";
          setDegreeState(primary);
          localStorage.setItem(DEGREE_KEY, primary);
        }
        if (data.intern_credits && Object.keys(data.intern_credits).length > 0) {
          setInternCreditsState(data.intern_credits);
          localStorage.setItem(INTERN_KEY, JSON.stringify(data.intern_credits));
        }
      })
      .catch(() => {})
      .finally(() => setSynced(true));
  }, [currentUser, idToken, synced]);

  // Debounce-save to API 1.5s after any state change (only after initial sync)
  const saveTimer = useRef(null);
  useEffect(() => {
    if (!currentUser || !idToken || !synced) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveUserProgress(
        { courses: completed, programs, intern_credits: internCredits },
        idToken
      );
    }, 1500);
    return () => clearTimeout(saveTimer.current);
  }, [completed, programs, internCredits, currentUser, idToken, synced]);

  function setDegree(d) {
    setDegreeState(d);
    localStorage.setItem(DEGREE_KEY, d);
    if (d) setProgramsState(prev => [d, ...prev.filter(p => p !== d)]);
  }

  function toggleProgram(prog) {
    setProgramsState(prev => {
      const next = prev.includes(prog) ? prev.filter(p => p !== prog) : [...prev, prog];
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
    programs, toggleProgram, setPrograms,
    toggleCourse, setInternAmount, internCredits,
    removeCourse, clearAll,
  };
}