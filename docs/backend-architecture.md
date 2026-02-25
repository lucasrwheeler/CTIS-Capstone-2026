# Backend Architecture

This backend powers the Academic Planner system and is built using Python, FastAPI, and PostgreSQL hosted on AWS RDS. The architecture is modular, database‑driven, and designed for future expansion into degree audits, scheduling, and AI‑assisted advising.

---

## 1. High-Level Overview

The backend consists of four major layers:

### **API Layer (FastAPI)**
- Exposes endpoints for eligibility checks, prerequisite expansion, and (future) next‑course recommendations.
- Handles request validation and response formatting.

### **Service Layer**
Implements the core business logic:
- `prerequisites.py` — direct prerequisite retrieval from the database  
- `prerequisite_engine.py` — full eligibility engine with AND/OR logic  
- (future) `next_courses.py` — “What can I take next?” engine  
- (future) degree audit engine

### **Database Layer (AWS RDS PostgreSQL)**
Stores all academic data:
- Courses  
- Prerequisites  
- Professors  
- Course–Professor mappings  
- Degree requirements  
- Semester offerings  

### **Utility Layer**
Shared helper functions:
- Normalization  
- Formatting  
- Input cleaning  
- Common logic reused across services  

---

## 2. Database Schema

The backend connects to a normalized academic database with six tables:

### **courses**
Stores the full academic course catalog.

| Column        | Type    | Description |
|---------------|---------|-------------|
| course_id     | text    | Primary key |
| title         | text    | Course title |
| description   | text    | Catalog description |
| credits       | text    | Credit hours |
| term_offered  | text    | Typical offering term |
| professor     | text    | Primary instructor |
| location      | text    | Classroom location |
| cross_listed  | text    | Cross-listed courses |
| level         | integer | Course level (100–400) |

---

### **prerequisites**
Each row represents one prerequisite expression.

| Column    | Type | Description |
|-----------|------|-------------|
| course_id | text | Course requiring the prereq |
| prereq    | text | Expression such as `CTIS 210` or `CTIS 310 OR CTIS 322` |

---

### **professors**
Stores faculty information.

| Column     | Type | Description |
|------------|------|-------------|
| name       | text | Professor name |
| department | text | Academic department |
| role       | text | Faculty role |

---

### **course_professors**
Join table mapping courses to professors.

| Column     | Type | Description |
|------------|------|-------------|
| course_id  | text | Course taught |
| professor  | text | Instructor |

---

### **degree_requirements**
Stores degree requirements for the CTIS major.

| Column           | Type | Description |
|------------------|------|-------------|
| degree           | text | Degree name |
| requirement_type | text | Required / elective |
| course_id        | text | Course fulfilling requirement |

---

### **semester_offerings**
Stores when courses are offered.  
**Currently empty.**

| Column    | Type | Description |
|-----------|------|-------------|
| course_id | text | Course offered |
| semester  | text | Fall / Spring / Summer |
| year      | int  | Year offered |

---

## 3. Database Layer (AWS RDS PostgreSQL)

The backend uses a fully managed PostgreSQL database hosted on AWS RDS.  
This database stores all academic data used by the eligibility engine, future degree audits, and scheduling features.

### 3.1 Database Connection

All database access goes through a single helper function:
... python
from backend.db.connection import get_connection

This function opens a secure connection to AWS RDS using environment variables:
- `DB_HOST`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

Each service function follows the same pattern:
- Open connection
- Create cursor
- Execute SQL
- Fetch results
- Close cursor
- Close connection

This ensures stateless, predictable behavior and prepares the backend for future migration to AWS Lambda.

### 3.2 Database Schema Overview
The database contains six core tables:

| Table Name  |                   purpose                   |
|-------------|---------------------------------------------|
|  `course_id`  |             Full course catalog             | 
|  `semester`   |   Prerequisite expressions (AND/OR logic)   | 
|  `year`       |             Faculty directory               |
|  `course_id`  |         FCourse ↔ Professor mapping         | 
| `semester`   |         Requirements for CTIS degree        | 
|  `year`       | When courses are offered (currently empty)  |

This schema supports:
- - Multi‑row AND prerequisites
- OR‑group prerequisites
- Recursive prerequisite chains
- Degree requirement mapping
- Many‑to‑many course–professor relationships

### 3.3 Data Import Summary
The following datasets were uploaded to the EC2 instance and imported into PostgreSQL:
- `courses.csv` → Imported successfully
- `prerequisites.json` → Imported successfully
- `professors.csv` → Imported successfully
- `course_professors.csv` → Imported successfully
- `requirements.json` → Imported successfully
- `semester_offerrings.csv` → Table created, 0 rows imported

The database was verified using:
\dt
**SELECT** * **FROM** professors LIMIT 5;
**SELECT** * **FROM** degree_requirements LIMIT 5;
**SELECT** * **FROM** semester_offerings LIMIT 5;

### 3.4 How the Backend Uses the Database
The backend interacts with the database through the service layer:

- `get_prerequisites(course_id)`
Retrieves prerequisite expressions from the prerequisites table.
- `evaluate_eligibility()`
Uses DB‑fetched prerequisites to determine eligibility.
- `expand_prereq_chain()`
Recursively queries prerequisites to build full dependency chains.
- (Future) `get_next_courses()`
Will query all courses and evaluate eligibility for each.

The backend does not use CSV files at runtime — all logic is database‑driven

---

## 4. Prerequisite Engine

The prerequisite engine is the core of the backend. It interprets prerequisite expressions stored in the database and determines whether a student is eligible to take a course.

### Key Features

### **✔ AND Logic**
Multiple rows in the `prerequisites` table represent **AND** conditions.  
Example:
CTIS 340 requires:
- CTIS 310
- CTIS 321
- CTIS 342


All must be satisfied.

### **✔ OR Logic**
A single row containing `"A OR B OR C"` represents an **OR group**.  
Example:
- CTIS 310
- CTIS 322
- CTIS 345


Any one of these satisfies the requirement.

### **✔ Instructor Permission Handling**
The engine recognizes `"INSTRUCTOR PERMISSION"` as a valid option but does **not** automatically satisfy it unless explicitly included in the completed list.

### **✔ Recursive Prerequisite Expansion**
`expand_prereq_chain(course_id)` walks the entire dependency graph to produce a full list of direct and indirect prerequisites.

### **✔ Eligibility Evaluation**
`evaluate_eligibility()` returns a structured result:

- `eligible`: True/False  
- `missing`: list of unmet requirements  
- `all_prerequisites`: full expanded chain  
- `completed`: user‑provided completed courses  

This engine is the foundation for the Day 11 “What Can I Take Next?” feature.

---

## 5. API Endpoints

The backend exposes a small but powerful set of FastAPI endpoints.

### **Current Endpoints**

#### `GET /prerequisites/{course_id}`
Returns all prerequisite expressions for a course.

#### `POST /eligibility`
Evaluates whether a student is eligible for a given course.

#### *(Planned)* `GET /next-courses`
Will return all courses a student is eligible to take next based on completed coursework.

### Endpoint Design Principles

- Stateless requests  
- Clean JSON responses  
- Delegation to service layer  
- Database‑driven logic  
- Clear separation of concerns  

---

## 6. Deployment Architecture

The backend runs on a cloud‑based architecture designed for reliability and future scalability.

### **Current Deployment**

- **AWS EC2**  
  Hosts the FastAPI backend and Uvicorn server.

- **AWS RDS PostgreSQL**  
  Stores all academic data persistently.

- **GitHub → EC2 Sync**  
  Manual deployment workflow using Git pull.

- **Uvicorn**  
  ASGI server running the FastAPI application.

### **Deployment Notes**

- Early issues included “zombie” Uvicorn processes on EC2, later resolved by killing stale processes and enforcing Git‑based sync.
- The backend is now stable, consistent, and predictable across deployments.

### **Future Deployment Plan**

- Migrate to **AWS Lambda + API Gateway** for serverless scaling.
- Add CI/CD pipeline for automated deployments.
- Add caching layer (Redis) for heavy queries like degree audits.

---

## 7. Future Expansion

The architecture is intentionally modular to support major future features.

### **Planned Enhancements**

#### **✔ Day 11 Engine — Next Course Recommendations**
Determine all courses a student can take next based on completed coursework.

#### **✔ Degree Audit Engine**
Use `degree_requirements` to evaluate progress toward graduation.

#### **✔ Semester Planning**
Use `semester_offerings` to build semester‑specific schedules.

#### **✔ AI‑Generated Explanations**
Integrate AWS Bedrock to generate natural‑language reasoning for eligibility and planning.

#### **✔ Advisor Dashboard**
Provide faculty with tools to view student progress and recommend courses.

#### **✔ Course Search & Filtering**
Search by professor, level, term, or requirement type.

---






