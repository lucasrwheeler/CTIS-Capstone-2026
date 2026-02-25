# Data Import Summary

This project uses several datasets imported into PostgreSQL. The following files were uploaded to the EC2 instance and imported into the database:

- `courses.csv`
- `professors.csv`
- `course_professors.csv`
- `prerequisites.json`
- `requirements.json`
- `semester_offerrings.csv` (table exists but currently empty)

## Import Notes

- Courses, prerequisites, professors, and degree requirements were successfully imported.
- Semester offerings were not imported and remain empty. This does not affect the eligibility engine.
- All tables were verified using `\dt` and sample queries in PostgreSQL.

## Future Work

- Populate `semester_offerings` for scheduling features.
- Add foreign key constraints for stronger relational integrity.
- Add indexes for faster prerequisite lookups.