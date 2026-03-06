// /lambda/degree-audit/cnsMajor.js

function runCnsMajorAudit(completed) {
  const CORE = [
    "CTIS 210",
    "CTIS 221",
    "CTIS 243",
    "CTIS 310",
    "CTIS 321",
    "CTIS 322",
    "CTIS 342",
    "CTIS 370",
    "CTIS 371"
  ];

  const ELECTIVES = [
    "CTIS 331",
    "CTIS 345",
    "CTIS 471"
  ];

  const completedSet = new Set(completed);

  const completedCore = CORE.filter(c => completedSet.has(c));
  const remainingCore = CORE.filter(c => !completedSet.has(c));

  const completedElectives = ELECTIVES.filter(c => completedSet.has(c));
  const electiveCount = completedElectives.length;
  const electiveOk = electiveCount >= 1;

  const remainingElectiveSlots = Math.max(0, 1 - electiveCount);
  const remainingElectiveOptions = electiveOk ? [] : ELECTIVES;

  const completedCount = completedCore.length + Math.min(electiveCount, 1);
  const progress = Math.min(completedCount / 10, 1.0);

  const recommended = [];
  recommended.push(...remainingCore);

  if (!electiveOk) {
    for (const course of ELECTIVES) {
      if (course !== "CTIS 471") recommended.push(course);
    }
    recommended.push("CTIS 471");
  }

  return {
    degree: "CNS Major",
    completed_core: completedCore,
    remaining_core: remainingCore,
    completed_electives: completedElectives,
    elective_slots_required: 1,
    elective_slots_filled: electiveCount,
    elective_satisfied: electiveOk,
    remaining_requirements: {
      core: remainingCore,
      elective_options: remainingElectiveOptions,
      elective_slots_remaining: remainingElectiveSlots
    },
    courses_completed_toward_degree: completedCount,
    total_courses_required: 10,
    progress_percent: progress,
    recommended_order: recommended,
    notes: `You have completed ${completedCount} of 10 required courses for the CNS major.`
  };
}

module.exports = { runCnsMajorAudit };