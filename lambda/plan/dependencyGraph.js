// /lambda/plan/dependencyGraph.js

const GRAPH = {
  "CTIS 210": [],

  "CTIS 221": ["CTIS 210"],

  "CTIS 243": [],

  "CTIS 310": ["CTIS 210"],

  "CTIS 320": ["CTIS 221", "CTIS 210"],

  "CTIS 321": ["CTIS 210", "CTIS 221"],

  "CTIS 322": ["CTIS 321"],

  "CTIS 342": ["CTIS 210", "CTIS 243"],

  "CTIS 345": ["CTIS 210", "CTIS 243"],

  "CTIS 370": ["CTIS 221"],

  "CTIS 371": ["CTIS 221"],

  "CTIS 440": ["CTIS 321", "CTIS 310", "CTIS 342"],

  "CTIS 471": ["CTIS 370"]
};

function getPrereqs(courseId) {
  return GRAPH[courseId] || [];
}

function getAllDependencies(courseId, visited = new Set()) {
  if (visited.has(courseId)) return [];
  visited.add(courseId);

  const direct = getPrereqs(courseId);
  const indirect = direct.flatMap(c => getAllDependencies(c, visited));

  return [...new Set([...direct, ...indirect])];
}

module.exports = {
  GRAPH,
  getPrereqs,
  getAllDependencies
};