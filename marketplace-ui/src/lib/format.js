export function formatDate(iso) {
  if (!iso) return "unknown date";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
