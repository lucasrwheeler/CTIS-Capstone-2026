## Daily Log — Day 11 / Day 12 Progress (Backend Intelligence Layer)
Date: February 25, 2026
Author: Lucas Wheeler
Focus: Restoring and validating the advising explanation engine, completing Day 10–11 backend logic, and aligning the roadmap.
## 1. Restored Day 10 POST Eligibility Endpoint
Today I discovered that my Day 10 POST endpoint (POST /eligibility/) was missing from the FastAPI router. The OpenAPI schema confirmed that only the older GET endpoints existed (GET /eligibility/ and GET /eligibility/{course_id}). This explained the repeated 405 Method Not Allowed errors when testing the advising explanation engine.
Fix Implemented:
I restored the Day 10 POST endpoint using a Pydantic model (EligibilityRequest) and reconnected it to the Day 9 logic (evaluate_eligibility) and the Day 10 explanation engine (build_explanation). After restarting the server, the endpoint worked exactly as intended.
## 2. Verified Full Advising Explanation Engine
After restoring the POST route, I successfully tested the advising engine with: {"course_id": "CTIS 440", "completed": ["CTIS 210", "CTIS 243"]}
The system returned:
- Eligibility result
- Missing prerequisites
- Full prerequisite chain
- Advisor-style explanation
- Recommended next steps
This confirms that the Day 10 advising engine is fully functional and aligned with the academic logic.
## 3. Validated Day 11 “Next Courses” Engine
I tested the Day 11 endpoint (POST /next-courses/) with a completed course list. The system correctly returned all eligible courses, missing prereqs (if any), the full prerequisite chain, and the completed courses. This confirms the next‑semester planning engine is working end‑to‑end.
## 4. Updated and Finalized the Roadmap
I finalized the realistic roadmap for Days 10–25, including:
- Day 10–12: Backend intelligence layer
- Day 13–14: Lambda migration
- Day 15–16: RDS + Bedrock integration
- Day 17–25: React frontend + CloudFront deployment
This roadmap is now aligned with the actual architecture and timeline.
## 5. Backend Intelligence Layer Status
Day 10 — Explanation Engine: Completed and fully functional
Day 11 — Next Courses Engine: Completed and fully functional
Day 12 — Degree Audit Engine: Next major backend task
The academic intelligence layer is nearly complete.
## 6. Next Steps
Immediate:
- Implement Day 12: Degree Audit Engine
- Identify remaining courses
- Group by requirement category
- Recommend order of completion
- Estimate time to graduation
Upcoming:
- Begin Lambda migration (Day 13–14)
- Prepare for RDS + Bedrock integration (Day 15–16)


 ## Day 11 — Next‑Course Engine Completed
Focus
Build the “What can I take next?” engine.
Accomplishments
- Implemented next‑course recommendation logic
- Added term‑based filtering (Fall/Spring availability)
- Integrated prerequisite checking into next‑course suggestions
- Validated engine using FastAPI prototype
- Ensured output is clean JSON for frontend consumption
Outcome
A working next‑course engine that intelligently recommends courses based on completed history and upcoming term.

## 🟧 Day 12 — Degree Audit Engine Completed
Focus
Build the full CTIS/CNS major/minor audit system.
Accomplishments
- Implemented:
- CTIS major audit
- CNS major audit
- CTIS minor audit
- CNS minor audit
- Added:
- completed core
- remaining core
- elective slots
- elective options
- progress percentage
- recommended order
- Validated logic using FastAPI prototype
- Ensured consistent JSON structure across all programs
Outcome
A complete academic audit engine capable of evaluating progress, remaining requirements, and recommended sequencing.
## 
🟨 Day 13 — Migration to Lambda (Node.js)
Focus
Move backend logic from FastAPI (Python) → AWS Lambda (Node.js).
Accomplishments
- Rewrote eligibility engine in Node.js
- Rewrote next‑course engine in Node.js
- Rewrote degree audit engine in Node.js
- Rewrote plan engine in Node.js
- Created Lambda folder structure:
- /eligibility
- /degree-audit
- /plan
- /courses (placeholder)
- /professors (placeholder)
- /health (placeholder)
- Converted static data structures into JS modules
- Ensured all engines return clean JSON responses
Outcome
The backend is now fully serverless and ready for API Gateway integration.

## 🟫 Day 14 — API Gateway Integration Completed
Focus
Expose Lambda functions as public API endpoints.
Accomplishments
- Created API Gateway routes:
- POST /eligibility
- POST /degree_audit
- POST /plan
- (placeholders for /courses, /professors, /health)
- Connected each route to its Lambda function
- Enabled Lambda Proxy Integration
- Added CORS headers
- Added IAM permissions for API Gateway → Lambda
- Deployed API to prod stage
- Successfully tested:
- Lambda test console
- API Gateway test console
- Verified:
- 200 OK responses
- Error handling
- JSON formatting
- Integration behavior
Outcome
The backend is now fully cloud‑native.
EC2 + FastAPI are officially retired.
Lambda + API Gateway are now the production backend.

## 🟦 Daily Log — Day 15 / Day 16 Progress (Backend Finalization + RDS Integration)
Date: March 17, 2026
Author: Lucas Wheeler
Focus: Completing the SQL‑driven academic intelligence layer, rebuilding the degree‑requirement database, finalizing Lambda logic, and validating the entire backend.

## 1. Rebuilt Degree Requirements Database (Authoritative Catalog Alignment)
Today I discovered that my earlier degree‑requirement data (both mine and the AI‑generated version) contained inaccuracies compared to the original Python audit engine from the FastAPI prototype.
To ensure absolute correctness, I rebuilt the entire degree_requirements table using the authoritative source:
- CTIS Major
- CNS Major
- CTIS Minor
- CNS Minor
Fix Implemented:
- Deleted all existing entries for the four programs
- Reinserted every core, elective, and internship requirement exactly as defined in the Python engine
- Added missing courses (e.g., ART 245, CTIS 104, CTIS 274, GEOL 340, PHIL 292, XD 220)
- Ensured capstones (CTIS 440, CTIS 471) were included correctly
- Verified all minors matched the catalog
Outcome:
The database is now 100% accurate, authoritative, and ready for SQL‑driven audits.

## 2. Implemented Program‑Level Rules (Not Stored in DB)
The Python engine included several rules that are not course‑level data:
- Elective slot counts
- Internship requirements
- Capstone ordering
- CTIS Minor 300‑level rule
- Total courses required per program
Fix Implemented:
Created a dedicated PROGRAM_RULES.js module containing:
- CTIS Major: 1 elective, 1 internship, 11 total courses
- CNS Major: 2 electives, 1 internship, 10 total courses
- CTIS Minor: 2 electives + 300‑level requirement
- CNS Minor: 1 elective
Outcome:
The SQL audit engine now mirrors the Python logic exactly.

## 3. Built the Final SQL‑Driven Degree Audit Engine (Node.js Lambda)
I completed the full migration of the degree audit engine from Python → Node.js → SQL.
Accomplishments:
- Implemented auditLogic.js
- Integrated SQL queries for requirements and prerequisites
- Added program‑level rules
- Added capstone‑last ordering
- Added internship logic
- Added elective slot logic
- Added CTIS Minor 300‑level rule
- Added eligibility checks for remaining courses
- Added progress percentage calculation
- Added recommended sequencing
Outcome:
A fully dynamic, SQL‑powered degree audit engine that matches the original Python behavior 1:1.

## 4. Implemented SQL‑Driven Distinct Credit Engine
Replaced the old hardcoded distinct‑credit logic with a dynamic SQL version.
Accomplishments:
- Created distinctSQL.js
- Fetched course lists directly from the database
- Computed shared courses
- Computed distinct courses
- Calculated total distinct credits
- Applied 48‑credit (major+minor) and 64‑credit (major+major) rules
- Returned clean JSON
Outcome:
A fully accurate distinct‑credit calculator that automatically adapts to catalog changes.

## 5. Updated Lambda Handler (index.js) to Support Both Modes
The degree‑audit Lambda now supports:
Mode 1 — Degree Audit
{ "degree": "CTIS_MAJOR", "completed": [...] }


Mode 2 — Distinct Credits
{ "programA": "CTIS_MAJOR", "programB": "CNS_MINOR" }


Fix Implemented:
- Added routing logic
- Added body parsing
- Added error handling
- Added CORS headers
- Ensured clean JSON responses
Outcome:
A single Lambda now handles both academic audit and distinct‑credit analysis.

## 6. Validated All Engines With Real Test Cases
I ran a full validation suite for:
- CTIS Major
- CNS Major
- CTIS Minor
- CNS Minor
- Distinct credits
Confirmed:
- Core logic
- Elective slot logic
- Internship logic
- Capstone ordering
- 300‑level rule
- Eligibility integration
- Progress calculation
- Distinct credit totals
Outcome:
The backend is now production‑ready, accurate, and fully validated.

## 7. Git Commit + Repository Update
Committed all Lambda updates, SQL rebuilds, and backend logic.
Outcome:
The backend milestone for Days 15–16 is complete and version‑controlled.

Summary
Days 15–16 focused on stabilizing, validating, and finalizing the backend.
I rebuilt the database, completed the SQL‑driven audit engine, implemented program‑level rules, added distinct‑credit logic, and validated everything end‑to‑end.
The backend is now fully serverless, fully SQL‑driven, and ready for frontend integration.

Next Steps (Day 17–18)
- Begin React frontend integration
- Build UI for:
- Degree audit
- Next‑course engine
- Distinct credits
- Connect frontend to API Gateway
- Prepare for S3 + CloudFront deployment


 # Daily Log — Day 17 (Frontend Integration Begins)

Date: March 24, 2026
Author: Lucas Wheeler
Focus: Connecting the React frontend to the fully serverless backend and validating all API Gateway → Lambda → RDS integrations.

1. Verified All Lambda Endpoints Through React
Today marked the first successful end‑to‑end integration between the React frontend and the serverless backend. I validated all three major academic intelligence endpoints:
- /degree_audit
- /eligibility
- /plan
Each endpoint returned clean, structured JSON directly into the React console:
- Degree audit returned the correct core/elective/internship breakdown
- Eligibility returned correct prerequisite logic
- Plan returned the upcoming term and recommended courses
Outcome:
The entire backend pipeline — React → API Gateway → Lambda → RDS → Lambda → React — is now fully operational.

2. Resolved CORS for Lambda Proxy Integrations
The eligibility endpoint initially failed due to missing CORS headers on the POST response. I fixed this by adding the full CORS header set directly inside the Lambda handler:
- Access-Control-Allow-Origin
- Access-Control-Allow-Headers
- Access-Control-Allow-Methods
This resolved the last remaining CORS issue.
Outcome:
All three endpoints now support cross‑origin requests from the React development server.

3. Updated Frontend API Layer (api.js)
I replaced the temporary test functions with proper API wrappers:
- getDegreeAudit(degree, completed)
- getEligibility(course_id, completed)
- getPlan(degree, completed)
Each function now sends correctly shaped JSON bodies and handles responses cleanly.
Outcome:
The frontend now communicates with the backend using production‑ready API calls.

4. Confirmed Lambda Logic With Real Test Inputs
After updating the Lambda code, I re‑uploaded the ZIP packages and validated each function using:
- Lambda test console
- API Gateway test console
- React frontend test buttons
All engines returned correct results, including:
- Eligibility logic
- Degree audit logic
- Next‑course planning logic
Outcome:
The backend is stable, validated, and ready for UI integration.

5. Completed Backend Milestone (Days 10–16)
With today’s work, the entire backend milestone is officially complete:
- Academic intelligence layer (audit, eligibility, planning)
- SQL‑driven engines
- Lambda migration
- API Gateway integration
- RDS connectivity
- CORS configuration
- React connectivity
Outcome:
The backend is now production‑ready and fully cloud‑native.

# Next Steps (Day 18–20)
- Begin building real React UI pages:
- Degree Audit
- Eligibility Checker
- Course Planner
- Distinct Credits
- Replace hard‑coded test calls with real user inputs
- Add remaining endpoints: /courses, /professors, /semester_offerings
- Prepare for S3 + CloudFront deployment

⭐ Summary
Today was the turning point where the backend stopped being theoretical and became a living system. All Lambda functions, SQL engines, and API routes are now fully integrated with the frontend. The next phase is UI/UX — transforming raw JSON into a polished, interactive advising platform.




# 🟩 Daily Log — Day 18 (Frontend Integration: Dynamic UI + API‑Driven Pages)
Date: March 27, 2026
Author: Lucas Wheeler
Focus: Converting the React frontend from prototype mode into a fully dynamic, database‑driven academic portal.

## 1. Replaced All Hardcoded Course Inputs With Dynamic Data
Today I removed every hardcoded course list from the frontend and replaced them with real data from the new /courses Lambda endpoint.
Completed:
- Added getCourses() to the API layer
- Updated:
- Degree Audit Page
- Eligibility Checker
- Course Planner
- Implemented:
- Dynamic course checklist
- Loading + error states
- Scrollable UI containers
- Clean checkbox toggling logic
Outcome:
All three major academic tools now pull live course data directly from the database. Any future catalog changes will automatically propagate to the UI.

## 2. Fully Integrated Degree Audit With Dynamic Course Selection
The Degree Audit page is now fully interactive and database‑driven.
Completed:
- Replaced static arrays with dynamic course list
- Added checkbox UI for completed courses
- Connected to /degree_audit Lambda
- Displayed:
- Completed core
- Remaining core
- Elective status
- Internship status
- Recommended next courses
- Eligible next courses
- Notes + progress
Outcome:
The Degree Audit page is now a complete, advisor‑grade tool powered entirely by the backend.

## 3. Upgraded Course Planner to Use Dynamic Course Data
The Course Planner page now mirrors the Degree Audit structure.
Completed:
- Removed comma‑separated input
- Added dynamic checklist
- Added major‑specific annotations (CTIS Core, Cyber Core)
- Connected to /plan Lambda
- Displayed:
- Top 4 recommended courses
- Eligible‑now courses
- Term‑specific planning
Outcome:
The planner now feels like a real advising system instead of a prototype.

## 4. Modernized the Eligibility Checker
The Eligibility Checker now uses the same dynamic course list as the other pages.
Completed:
- Kept “Course to Check” as a typed input
- Replaced completed‑courses text box with dynamic checklist
- Preserved advanced prerequisite formatting logic
- Connected to /eligibility Lambda
Outcome:
Eligibility checks are now consistent, accurate, and user‑friendly.

## 5. Unified UI Patterns Across All Pages
All academic tools now share:
- Dynamic data loading
- Scrollable checklists
- Clean labels
- Consistent spacing
- Error + loading states
- Identical checkbox behavior
Outcome:
The frontend now feels cohesive and professional, ready for styling and theming.

## ⭐ Summary
Today marked the moment the frontend became alive.
All major academic tools — Degree Audit, Eligibility Checker, and Course Planner — are now fully integrated with the serverless backend.
The system is no longer a prototype.
It’s a functioning academic advising platform.

## 🔜 Next Steps (Day 19–20)
As you outlined:
- Courses Page
- Add course descriptions from the database
- Build a clean catalog UI
- Professor Page
- Show faculty + courses taught
- Semester Availability Page
- Show Fall/Spring/Summer offerings
- About Me Page
- Student profile
- Users / Alumni Page
- Directory of students + alumni
- Make everything pretty
- Layout
- Navigation
- Styling
- Icons
- Color themes


