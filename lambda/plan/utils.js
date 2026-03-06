// /lambda/plan/utils.js

function removeCompleted(courses, completed) {
  return courses.filter(c => !completed.includes(c));
}

function sortByDependencyDepth(courses, getAllDependencies) {
  return [...courses].sort((a, b) => {
    const depthA = getAllDependencies(a).length;
    const depthB = getAllDependencies(b).length;
    return depthA - depthB;
  });
}

module.exports = {
  removeCompleted,
  sortByDependencyDepth
};