# Daily Log

This log documents the full development history of the Academic Planner system — including the real struggles, breakthroughs, architectural decisions, and workflow pivots that shaped the project. It combines early Terraform/Lambda planning with the later EC2/FastAPI backend implementation.

---

## Day 1 — Project Setup
- Installed AWS CLI, Node.js, and Terraform.
- Created IAM user and configured AWS CLI credentials.
- Set up GitHub repository and initial project structure.
- Fixed Windows npm execution policy issues.
- Established initial goal: serverless Lambda backend + multi‑page frontend.

---

## Day 2 — Architecture Planning
- Designed initial architecture using AWS Lambda, API Gateway, S3, and DynamoDB.
- Created the first architecture diagram.
- Documented system components and data flow.
- Identified need for:
  - multi‑page frontend
  - backend API
  - academic data ingestion
  - eligibility logic

---

## Day 3 — Project Structure + Terraform Init
- Created folder structure:
  - `frontend/`
  - `backend/`
  - `iac/`
  - `docs/`
- Created initial Terraform `main.tf`.
- Ran `terraform init` successfully.
- Created documentation folder structure for MkDocs.
- Began drafting academic datasets (courses, prerequisites, professors).

---

## Day 4 — Data Import (First Major Struggle Day)
- Uploaded all data files to EC2 using SCP:
  - `courses.csv`
  - `professors.csv`
  - `course_professors.csv`
  - `semester_offerrings.csv`
  - `prerequisites.json`
  - `requirements.json`
- Attempted multiple import methods:
  - `COPY` command (permission errors)
  - Python loader scripts (formatting issues)
  - Manual SQL inserts (slow and error‑prone)
- Encountered:
  - CSV quoting errors
  - JSON parsing failures
  - Path permission issues
  - Encoding inconsistencies
- Eventually succeeded importing:
  - **courses**
  - **prerequisites**
  - **professors**
  - **course_professors**
  - **degree_requirements**
- `semester_offerrings.csv` created the table but imported **0 rows**.

---

## Day 5 — Database Verification
- Ran `\dt` to confirm all tables exist.
- Queried sample rows from each table.
- Verified:
  - `courses` populated
  - `prerequisites` populated with OR expressions
  - `professors` populated
  - `course_professors` populated
  - `degree_requirements` populated
  - `semester_offerings` empty
- Confirmed database schema is complete and ready for backend integration.

---

## Day 6 — Backend DB Integration (One of the Hardest Days)
This was one of the longest, most frustrating days of the project.

- Implemented `get_connection()` using psycopg2.
- Fought through:
  - connection failures  
  - environment variable issues  
  - psycopg2 installation quirks  
  - EC2 path inconsistencies  
- Created `get_prerequisites(course_id)` to pull prerequisite expressions.
- Debugged:
  - cursor errors  
  - missing imports  
  - mismatched table names  
  - SQL syntax issues  
- Finally got FastAPI successfully pulling data from RDS.
- This was the first moment the backend and database truly “talked.”

---

## Day 7 — Backend Stability + Prerequisite Endpoint (Extremely Hard Day)
This was the most technically intense day so far.

### Completed:
- `/prerequisites/{course_id}` endpoint implemented.
- Path converter working correctly.
- Returns correct CTIS prerequisites.

### Database normalization:
- Fixed dash → space inconsistencies.
- Normalized all CTIS course IDs.
- Verified prerequisites table correctness.

### Server stability:
- Killed all ghost Uvicorn processes.
- Resolved systemd conflicts.
- Ensured no tmux/screen/nohup leftovers.
- Verified port 8000 clean and controlled.

### Codebase sync:
- EC2 code now matches GitHub.
- Router imports corrected.
- Main app includes all routers.

### OpenAPI behavior:
- Confirmed FastAPI hides path converters in docs (expected behavior).

### Environment verification:
- Correct EC2 instance.
- Correct virtual environment.
- Correct directory structure.
- Correct Python path.

### End‑to‑end test:
- CTIS prerequisites return correct results.
- Nonexistent courses return `[]` (correct behavior).

### Deployment:
- Committed and pushed stable backend to GitHub.
- Pulled latest code on EC2.

Day 7 marked the moment the backend became **stable, correct, and production‑ready**.

---

## Day 8 — Recursive Prerequisite Chains (Still Hard)
- Implemented `expand_prereq_chain(course_id)`.
- Initial attempts caused infinite recursion.
- Solved using a `visited` set to prevent loops.
- Verified chain expansion for complex courses like CTIS 440.
- Cleaned up service structure and improved readability.
- This was the day the system became “smart” — it could understand indirect prerequisites.

---

## Day 9 — Full Eligibility Engine (Breakthrough Day)
- Implemented `evaluate_eligibility()` with:
  - Missing requirement detection
  - Full prerequisite chain reporting
  - Instructor permission handling
- Tested with multiple course scenarios.
- Fixed bugs involving OR‑groups not matching completed courses.
- Engine now returns structured JSON with eligibility, missing prereqs, and chain expansion.
- This was the first day the system felt complete and reliable.

---

## Day 10 — Environment Cleanup & Stability
- Discovered EC2 had multiple “zombie” Uvicorn processes.
- Killed all stale processes and restored clean environment.
- Re‑synced backend using GitHub instead of manual EC2 edits.
- Rebuilt folder structure for clarity and consistency.
- Verified server runs cleanly with no ghost code or stale imports.
- This day restored confidence in the deployment environment.

---

## Day 11 — Documentation System Setup
- Installed MkDocs with Material theme.
- Created documentation site structure.
- Added pages:
  - Overview
  - Backend Architecture
  - Database Schema
  - Data Import Summary
  - Risks & Ethics
  - Daily Log
- Fixed navigation issues.
- Successfully ran `mkdocs serve` locally.
- Verified all tables using:
  - "(\dt SELECT * FROM professors LIMIT 5; SELECT * FROM degree_requirements LIMIT 5; SELECT * FROM semester_offerings LIMIT 5)"
- - Confirmed:
- `professors` table populated  
- `degree_requirements` table populated  
- `semester_offerings` table empty  
- Updated documentation to reflect actual DB state.
- Confirmed backend uses DB data (not CSV) for eligibility logic.

---

## Next Steps
- Build Day 11 engine: **“What Can I Take Next?”**
- Add degree audit engine using `degree_requirements`.
- Add semester planning engine using `semester_offerings`.
- Add AI‑generated explanations using AWS Bedrock.
- Build advisor dashboard endpoints.
- Add course search and filtering.
