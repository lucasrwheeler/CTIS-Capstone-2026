const PREREQS = {
  "CTIS 310": [["CTIS 210"]],
  "CTIS 320": [["CTIS 221"], ["CTIS 210"]],
  "CTIS 321": [["CTIS 210"], ["CTIS 221"]],
  "CTIS 322": [["CTIS 321"]],
  "CTIS 342": [["CTIS 210"], ["CTIS 243"]],
  "CTIS 345": [["CTIS 210"], ["CTIS 243"]],
  "CTIS 370": [["CTIS 221"]],
  "CTIS 371": [["CTIS 221"]],
  "CTIS 440": [["CTIS 321"], ["CTIS 310"], ["CTIS 342"]],
  "CTIS 471": [["CTIS 370"]]
};

const ALL_COURSES = Object.keys(PREREQS);

module.exports = {
  PREREQS,
  ALL_COURSES
};