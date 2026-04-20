import { Routes, Route, Link } from "react-router-dom";
import { getDegreeAudit, getEligibility, getPlan } from "./api";
import DegreeAuditPage from "./pages/DegreeAuditPage";
import EligibilityPage from "./pages/EligibilityPage";
import CoursePlannerPage from "./pages/CoursePlannerPage";
import CoursesList from "./pages/CoursesList";
import Professors from "./pages/Professors";
import ProfessorProfile from "./pages/ProfessorProfile";
import DistinctCredits from "./pages/DistinctCredits";
import AIAdvisorPage from "./pages/AIAdvisorPage";




// --------------------------------------
// HOME PAGE
// --------------------------------------
function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Guilford CTIS Department Academic Portal</h1>

      <Link to="/degree-audit">Go to Degree Audit</Link>
      <br />
      <Link to="/eligibility">Check Course Eligibility</Link>
      <br /> <Link to="/planner">Course Planner</Link>
     <br /> <Link to="/courses">Courses List</Link>
<br /> <Link to="/professors">Professors</Link>
<Link to="/ai-advisor">AI Academic Advisor</Link>

      <p>Frontend is running and ready to connect to the backend.</p>
    </div>
  );
}

// --------------------------------------
// OLD TEST PAGE (optional)
// --------------------------------------
function DegreeAudit() {
  async function testAudit() {
    console.log(await getDegreeAudit("CTIS_MAJOR", []));
  }

  async function testEligibility() {
    console.log(
      await getEligibility("CTIS 310", ["CTIS 210", "CTIS 221"])
    );
  }

  async function testPlan() {
    console.log(await getPlan("CTIS_MAJOR", []));
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Degree Audit Page</h1>
      <button onClick={testAudit}>Test Degree Audit</button>
      <button onClick={testEligibility}>Test Eligibility</button>
      <button onClick={testPlan}>Test Plan</button>
    </div>
  );
}

// --------------------------------------
// PLACEHOLDER PAGES
// --------------------------------------
function Catalog() {
  return <h1>Course Catalog</h1>;
}

function CourseDetail() {
  return <h1>Course Detail</h1>;
}

function ProfessorDetail() {
  return <h1>Professor Detail</h1>;
}


// --------------------------------------
// MAIN APP ROUTER
// --------------------------------------
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Real Pages */}
      <Route path="/degree-audit" element={<DegreeAuditPage />} />
      <Route path="/eligibility" element={<EligibilityPage />} />
      <Route path="/planner" element={<CoursePlannerPage />} />
      <Route path="/courses" element={<CoursesList />} />
      <Route path="/professors" element={<Professors />} />
<Route path="/professors/:name" element={<ProfessorProfile />} />
<Route path="/distinct" element={<DistinctCredits />} />
<Route path="/ai-advisor" element={<AIAdvisorPage />} />


      {/* Placeholder Pages */}
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/course/:id" element={<CourseDetail />} />
      <Route path="/professor/:id" element={<ProfessorDetail />} />
      
      

      {/* Old test page (optional) */}
      {/* <Route path="/audit" element={<DegreeAudit />} /> */}
    </Routes>
  );
}