# Database Schema

This project uses a PostgreSQL database hosted on AWS RDS. The schema includes six core tables that store course information, prerequisites, professors, degree requirements, and semester offerings.

## 1. courses
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

## 2. prerequisites
Stores prerequisite expressions for each course. Each row represents one prerequisite expression.

| Column    | Type | Description |
|-----------|------|-------------|
| course_id | text | Course requiring the prereq |
| prereq    | text | Expression such as `CTIS 210` or `CTIS 310 OR CTIS 322` |

## 3. professors
Stores faculty information.

| Column     | Type | Description |
|------------|------|-------------|
| name       | text | Professor name |
| department | text | Academic department |
| role       | text | Faculty role |

## 4. course_professors
Join table mapping courses to professors.

| Column     | Type | Description |
|------------|------|-------------|
| course_id  | text | Course taught |
| professor  | text | Instructor |

## 5. degree_requirements
Stores degree requirements for the CTIS major.

| Column           | Type | Description |
|------------------|------|-------------|
| degree           | text | Degree name |
| requirement_type | text | Required / elective |
| course_id        | text | Course fulfilling requirement |

## 6. semester_offerings
Stores when courses are offered. Currently empty.

| Column    | Type | Description |
|-----------|------|-------------|
| course_id | text | Course offered |
| semester  | text | Fall / Spring / Summer |
| year      | int  | Year offered |