// /lambda/degree-audit/cnsMinor.js

function runCnsMinorAudit(completed) {
  const CORE = ["CTIS 221", "CTIS 322", "CTIS 371"];

  const ELECTIVES = [
    "BUS 402",
    "CTIS 210",
    "CTIS 230",
    "CTIS 243",
    "CTIS 321",
    "CTIS 331",
    "CTIS 342",
    "CTIS 370",
    "CTIS 471",
    "JPS 200",
    "JPS 333",
    "JPS 330",
    "PHIL 241"
  ];

  const completedSet = new Set(completed);

  const completedCore = CORE.filter(c => completedSet.has(c));
  const remainingCore = CORE.filter(c => !completedSet.has(c));

  const completedElectives = ELECTIVES.filter(c => completedSet.has(c));
  const electiveCount = completedElectives.length;
  const electiveOk = electiveCount >= 1;

  const remainingElectiveOptions = electiveOk ? [] : ELECTIVES;

  const completedCount = completedCore.length + Math.min(electiveCount, 1);
  const progress = Math.min(completedCount / 4, 1.0);

  const recommended = [];
  recommended.push(...remainingCore);

  if (!electiveOk) {
    for (const course of ELECTIVES) {
      if (course !== "CTIS 471") recommended.push(course);
    }
    recommended.push("CTIS 471");
  }

  return {
    degree: "CNS Minor",
    completed_core: completedCore,
    remaining_core: remainingCore,
    completed_electives: completedElectives,
    elective_slots_required: 1,
    elective_slots_filled: electiveCount,
    elective_satisfied: electiveOk,
    remaining_requirements: {
      core: remainingCore,
      elective_options: remainingElectiveOptions,
      elective_slots_remaining: 1 - electiveCount
    },
    courses_completed_toward_degree: completedCount,
    total_courses_required: 4,
    progress_percent: progress,
    recommended_order: recommended,
    notes: `You have completed ${completedCount} of 4 required courses for the CNS minor.`
  };
}

module.exports = { runCnsMinorAudit };