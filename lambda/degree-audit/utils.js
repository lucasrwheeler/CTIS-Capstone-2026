// /lambda/degree-audit/utils.js

function normalizeList(list) {
  return Array.from(new Set(list));
}

function sortCatalogOrder(list, catalogOrder) {
  const orderMap = new Map(catalogOrder.map((c, i) => [c, i]));
  return [...list].sort((a, b) => (orderMap.get(a) ?? 999) - (orderMap.get(b) ?? 999));
}

module.exports = {
  normalizeList,
  sortCatalogOrder
};