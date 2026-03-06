// /lambda/degree-audit/ctisMinor.js

function runCtisMinorAudit(completed) {
  const CORE = ["CTIS 243", "CTIS 210"];

  const ELECTIVES = [
    "CTIS 230",
    "CTIS 310",
    "CTIS 321",
    "CTIS 322",
    "CTIS 331",
    "CTIS 342",
    "CTIS 345"
  ];

  const completedSet = new Set(completed);

  const completedCore = CORE.filter(c => completedSet.has(c));
  const remainingCore = CORE.filter(c => !completedSet.has(c));

  const completedElectives = ELECTIVES.filter(c => completedSet.has(c));
  const electiveCount = completedElectives.length;

  const has300 = completedElectives.some(c => c.startsWith("CTIS 3"));
  const electiveOk = electiveCount >= 2 && has300;

  const remainingElectiveSlots = Math.max(0, 2 - electiveCount);
  const remainingElectiveOptions = electiveOk ? [] : ELECTIVES;

  const completedCount = completedCore.length + Math.min(electiveCount, 2);
  const progress = Math.min(completedCount / 4, 1.0);

  const recommended = [];
  recommended.push(...remainingCore);

  if (!electiveOk) {
    recommended.push(...ELECTIVES);
  }

  return {
    degree: "CTIS Minor",
    completed_core: completedCore,
    remaining_core: remainingCore,
    completed_electives: completedElectives,
    elective_slots_required: 2,
    elective_slots_filled: electiveCount,
    elective_satisfied: electiveOk,
    remaining_requirements: {
      core: remainingCore,
      elective_options: remainingElectiveOptions,
      elective_slots_remaining: remainingElectiveSlots,
      "300_level_required": !has300
    },
    courses_completed_toward_degree: completedCount,
    total_courses_required: 4,
    progress_percent: progress,
    recommended_order: recommended,
    notes: `You have completed ${completedCount} of 4 required courses for the CTIS minor.`
  };
}

module.exports = { runCtisMinorAudit };