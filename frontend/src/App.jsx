import { Routes, Route } from "react-router-dom";
import { getDegreeAudit, getEligibility, getPlan } from "./api";




export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/audit" element={<DegreeAudit />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/course/:id" element={<CourseDetail />} />
      <Route path="/professor/:id" element={<ProfessorDetail />} />
      <Route path="/distinct" element={<DistinctCredits />} />
    </Routes>
  );
}

function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>VCCC Academic Portal</h1>
      <p>Frontend is running and ready to connect to the backend.</p>
    </div>
  );
}

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



function Catalog() {
  return <h1>Course Catalog</h1>;
}

function CourseDetail() {
  return <h1>Course Detail</h1>;
}

function ProfessorDetail() {
  return <h1>Professor Detail</h1>;
}

function DistinctCredits() {
  return <h1>Distinct Credits Comparison</h1>;
}