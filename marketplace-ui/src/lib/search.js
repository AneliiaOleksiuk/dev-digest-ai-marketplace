import Fuse from "fuse.js";

// Weighted so a name/title match ranks above a match buried in the body —
// this is what makes "I need a skill for X" style keyword queries useful.
const OPTIONS = {
  includeScore: true,
  threshold: 0.35,
  keys: [
    { name: "title", weight: 0.4 },
    { name: "name", weight: 0.3 },
    { name: "description", weight: 0.2 },
    { name: "tags", weight: 0.15 },
    { name: "body", weight: 0.05 },
  ],
};

export function createSearchIndex(items) {
  return new Fuse(items, OPTIONS);
}

export function searchItems(fuse, items, query) {
  if (!query.trim()) return items;
  return fuse.search(query).map((r) => r.item);
}
