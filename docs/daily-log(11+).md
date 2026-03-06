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
