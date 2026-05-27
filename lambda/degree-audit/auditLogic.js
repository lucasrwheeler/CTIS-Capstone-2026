/**
 * @file auditLogic.js
 * @description Core degree audit computation engine.
 *
 * Orchestrates the full degree audit pipeline:
 *   1. Loads degree requirements from RDS via degreeSQL
 *   2. Applies PROGRAM_RULES business logic (elective counts, internship, capstone)
 *   3. Computes completion status for core, elective, and internship categories
 *   4. Enforces special rules (e.g. CTIS Minor 300-level elective requirement)
 *   5. Calculates overall progress percentage
 *   6. Builds a recommended course order (core → internship → electives → capstone)
 *   7. Runs eligibility checks on all remaining courses to identify what's takeable now
 *
 * This module contains the highest-level business logic in the backend.
 * All database access is delegated to degreeSQL and eligibilitySQL.
 *
 * @module auditLogic
 * @requires ./degreeSQL     - RDS query for requirements
 * @requires ./eligibilitySQL - Prerequisite evaluation
 * @requires ./PROGRAM_RULES  - Static program configuration
 */

const { getRequirementsForDegree } = require('./degreeSQL');
const { checkEligibilitySQL }       = require('./eligibilitySQL');
const { PROGRAM_RULES }             = require('./PROGRAM_RULES');

/**
 * Performs a complete degree audit for a student.
 *
 * Compares the student's completed courses against all requirements for
 * the specified degree program and returns a structured audit report.
 *
 * @async
 * @param {import('pg').Client} client    - Active, connected PostgreSQL client
 * @param {string}              degree    - Program code (must be a key in PROGRAM_RULES)
 * @param {string[]}            completed - Array of completed course IDs
 * @returns {Promise<{
 *   degree:                        string,
 *   completed_core:                string[],
 *   remaining_core:                string[],
 *   internship_satisfied:          boolean,
 *   elective_satisfied:            boolean,
 *   completed_electives:           string[],
 *   remaining_requirements:        {
 *     core:                        string[],
 *     internship:                  string[],
 *     elective_options:            string[],
 *     elective_slots_remaining:    number,
 *     requires_300_level:          boolean,
 *     has_300_level:               boolean
 *   },
 *   courses_completed_toward_degree: number,
 *   total_courses_required:        number,
 *   progress_percent:              number,
 *   eligible_next:                 string[],
 *   recommended_order:             string[],
 *   notes:                         string
 * }>}
 * @throws {Error} If the degree code is not found in PROGRAM_RULES
 */
async function buildAudit(client, degree, completed) {
  const completedSet = new Set(completed);
  const rules        = PROGRAM_RULES[degree];

  if (!rules) {
    throw new Error(`Unknown degree: ${degree}`);
  }

  // ── Step 1: Load requirements from RDS ──────────────────────────────────────
  // Returns { Core: [...], Elective: [...], Internship: [...] }
  const requirements = await getRequirementsForDegree(client, degree);

  const core        = requirements.Core       || [];
  const electives   = requirements.Elective   || [];
  const internships = requirements.Internship || [];

  // ── Step 2: Completed vs remaining for each category ────────────────────────
  const completedCore      = core.filter(c =>  completedSet.has(c));
  const remainingCore      = core.filter(c => !completedSet.has(c));

  const completedElectives = electives.filter(c => completedSet.has(c));
  const electiveCount      = completedElectives.length;
  const electiveSatisfied  = electiveCount >= rules.electives_required;

  // If elective requirement is already met, no options remain to show
  const remainingElectiveOptions = electiveSatisfied ? [] : electives;
  const remainingElectiveSlots   = Math.max(0, rules.electives_required - electiveCount);

  // ── Step 3: Internship logic ─────────────────────────────────────────────────
  // Satisfied if any internship course (CTIS 290 or CTIS 390) was completed
  let internshipSatisfied = true;
  let remainingInternship = [];

  if (rules.internship_required) {
    internshipSatisfied = internships.some(c => completedSet.has(c));
    remainingInternship = internshipSatisfied ? [] : internships;
  }

  // ── Step 4: CTIS Minor 300-level special rule ────────────────────────────────
  // CTIS Minor requires at least one 300-level elective (course ID starts with "CTIS 3")
  let has300Level = true;
  if (rules.require_300_level) {
    has300Level = completedElectives.some(c => c.startsWith("CTIS 3"));
  }

  const electiveRuleOK = electiveSatisfied && has300Level;

  // ── Step 5: Progress calculation ────────────────────────────────────────────
  const internshipCount = rules.internship_required && internshipSatisfied ? 1 : 0;

  const completedCount =
    completedCore.length +
    internshipCount +
    Math.min(electiveCount, rules.electives_required);

  // Capped at 1.0 (100%) — prevents display overflow if extra courses taken
  const progress = Math.min(completedCount / rules.total_courses_required, 1.0);

  // ── Step 6: Recommended course order ────────────────────────────────────────
  // Order: core (excluding capstone) → internship → electives → capstone last
  const recommended = [];

  for (const course of remainingCore) {
    if (course !== rules.capstone) recommended.push(course);
  }

  if (!internshipSatisfied)    recommended.push(...internships);
  if (!electiveRuleOK)         recommended.push(...electives);

  // Capstone always goes last — must be taken after all other requirements
  if (remainingCore.includes(rules.capstone)) {
    recommended.push(rules.capstone);
  }

  // ── Step 7: Eligibility check on all remaining courses ───────────────────────
  // Runs checkEligibilitySQL on every remaining required course to surface
  // what the student can actually register for right now
  const eligibleNext = [];
  for (const course of [...remainingCore, ...remainingElectiveOptions]) {
    const result = await checkEligibilitySQL(client, course, completed);
    if (result.eligible) eligibleNext.push(course);
  }

  // ── Step 8: Return structured audit report ───────────────────────────────────
  return {
    degree,
    completed_core:                  completedCore,
    remaining_core:                  remainingCore,
    internship_satisfied:            internshipSatisfied,
    elective_satisfied:              electiveRuleOK,
    completed_electives:             completedElectives,
    remaining_requirements: {
      core:                          remainingCore,
      internship:                    remainingInternship,
      elective_options:              remainingElectiveOptions,
      elective_slots_remaining:      remainingElectiveSlots,
      requires_300_level:            !!rules.require_300_level,
      has_300_level:                 has300Level
    },
    courses_completed_toward_degree: completedCount,
    total_courses_required:          rules.total_courses_required,
    progress_percent:                progress,
    eligible_next:                   eligibleNext,
    recommended_order:               recommended,
    notes: `You have completed ${completedCount} of ${rules.total_courses_required} required courses for the ${degree.replace('_', ' ')}.`
  };
}

module.exports = { buildAudit };