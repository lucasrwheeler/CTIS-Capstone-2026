/**
 * @file PROGRAM_RULES.js
 * @description Static configuration object defining the academic rules for each
 * degree program offered by the Guilford CTIS department.
 *
 * This file is the single source of truth for program-level business logic
 * that does NOT live in the database — specifically the numeric constraints
 * that govern how the degree audit engine evaluates completion.
 *
 * Why not store this in RDS?
 *   These are policy rules, not data rows. They change rarely (once per
 *   catalog cycle) and need to be version-controlled alongside the code
 *   that interprets them. Keeping them here makes the audit logic auditable
 *   and reproducible without a database query.
 *
 * Supported programs:
 *   - CTIS_MAJOR  — Bachelor's in Computing Technology & Information Systems
 *   - CNS_MAJOR   — Bachelor's in Cyber & Network Security Management
 *   - CTIS_MINOR  — Minor in CTIS
 *   - CNS_MINOR   — Minor in CNS
 *
 * @module PROGRAM_RULES
 */

/**
 * Rule configuration for each supported degree program.
 *
 * Each key is a program code matching the `degree` column in the
 * `degree_requirements` RDS table.
 *
 * @typedef  {Object} ProgramRule
 * @property {number}  electives_required    - Number of elective courses needed to satisfy the elective requirement
 * @property {boolean} [internship_required] - If true, at least one internship course (CTIS 290 or CTIS 390) must be completed
 * @property {boolean} [require_300_level]   - If true (CTIS Minor), at least one 300-level elective is required
 * @property {number}  total_courses_required - Total course count needed for degree completion (used for progress %)
 * @property {string}  [capstone]            - Course ID of the capstone course; always scheduled last in recommended order
 *
 * @type {Object.<string, ProgramRule>}
 */
const PROGRAM_RULES = {

  /**
   * CTIS Major — 11 courses total.
   * Requires 1 elective, 1 internship, and CTIS 440 as the capstone.
   */
  CTIS_MAJOR: {
    electives_required:     1,
    internship_required:    1,
    total_courses_required: 11,
    capstone:               "CTIS 440"
  },

  /**
   * CNS Major — 10 courses total.
   * Requires 2 electives, 1 internship, and CTIS 471 as the capstone.
   */
  CNS_MAJOR: {
    electives_required:     2,
    internship_required:    1,
    total_courses_required: 10,
    capstone:               "CTIS 471"
  },

  /**
   * CTIS Minor — 4 courses total.
   * Requires 2 electives, at least one of which must be a 300-level course.
   * No internship or capstone requirement.
   */
  CTIS_MINOR: {
    electives_required:     2,
    require_300_level:      true,
    total_courses_required: 4
  },

  /**
   * CNS Minor — 4 courses total.
   * Requires 1 elective. No 300-level, internship, or capstone requirement.
   */
  CNS_MINOR: {
    electives_required:     1,
    total_courses_required: 4
  }
};

console.log("PROGRAM_RULES LOADED:", Object.keys(PROGRAM_RULES));

module.exports = { PROGRAM_RULES };