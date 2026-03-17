const { getRequirementsForDegree } = require('./degreeSQL');
const { checkEligibilitySQL } = require('./eligibilitySQL');
const { PROGRAM_RULES } = require('./PROGRAM_RULES');

async function buildAudit(client, degree, completed) {
  const completedSet = new Set(completed);
  const rules = PROGRAM_RULES[degree];

  if (!rules) {
    throw new Error(`Unknown degree: ${degree}`);
  }

  // 1. Load requirements from DB
  const requirements = await getRequirementsForDegree(client, degree);

  const core = requirements.Core || [];
  const electives = requirements.Elective || [];
  const internships = requirements.Internship || [];

  // 2. Completed vs remaining
  const completedCore = core.filter(c => completedSet.has(c));
  const remainingCore = core.filter(c => !completedSet.has(c));

  const completedElectives = electives.filter(c => completedSet.has(c));
  const electiveCount = completedElectives.length;
  const electiveSatisfied = electiveCount >= rules.electives_required;

  const remainingElectiveOptions = electiveSatisfied ? [] : electives;
  const remainingElectiveSlots = Math.max(0, rules.electives_required - electiveCount);

  // 3. Internship logic
  let internshipSatisfied = true;
  let remainingInternship = [];

  if (rules.internship_required) {
    internshipSatisfied = internships.some(c => completedSet.has(c));
    remainingInternship = internshipSatisfied ? [] : internships;
  }

  // 4. Special rule: CTIS Minor 300-level requirement
  let has300Level = true;
  if (rules.require_300_level) {
    has300Level = completedElectives.some(c => c.startsWith("CTIS 3"));
  }

  const electiveRuleOK = electiveSatisfied && has300Level;

  // 5. Count courses toward total
  const completedCount =
    completedCore.length +
    (internshipSatisfied ? 1 : 0) +
    Math.min(electiveCount, rules.electives_required);

  const progress = Math.min(completedCount / rules.total_courses_required, 1.0);

  // 6. Recommended order
  const recommended = [];

  // All remaining core except capstone
  for (const course of remainingCore) {
    if (course !== rules.capstone) {
      recommended.push(course);
    }
  }

  // Internship
  if (!internshipSatisfied) {
    recommended.push(...internships);
  }

  // Electives
  if (!electiveRuleOK) {
    recommended.push(...electives);
  }

  // Capstone last
  if (remainingCore.includes(rules.capstone)) {
    recommended.push(rules.capstone);
  }

  // 7. Eligibility for remaining courses
  const eligibleNext = [];
  for (const course of [...remainingCore, ...remainingElectiveOptions]) {
    const result = await checkEligibilitySQL(client, course, completed);
    if (result.eligible) eligibleNext.push(course);
  }

  // 8. Final structured audit object
  return {
    degree,
    completed_core: completedCore,
    remaining_core: remainingCore,
    internship_satisfied: internshipSatisfied,
    elective_satisfied: electiveRuleOK,
    completed_electives: completedElectives,
    remaining_requirements: {
      core: remainingCore,
      internship: remainingInternship,
      elective_options: remainingElectiveOptions,
      elective_slots_remaining: remainingElectiveSlots,
      requires_300_level: !!rules.require_300_level,
      has_300_level: has300Level
    },
    courses_completed_toward_degree: completedCount,
    total_courses_required: rules.total_courses_required,
    progress_percent: progress,
    eligible_next: eligibleNext,
    recommended_order: recommended,
    notes: `You have completed ${completedCount} of ${rules.total_courses_required} required courses for the ${degree.replace('_', ' ')}.`
  };
}

module.exports = { buildAudit };