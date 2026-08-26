export default function QualityBadges({ quality }) {
  if (!quality) return null;
  const badges = [
    quality.validated && { label: "Validated", ok: true },
    quality.hasExamples && { label: "Has examples", ok: true },
    quality.hasHooks && { label: "Has hooks", ok: true },
  ].filter(Boolean);

  if (badges.length === 0) return null;

  return (
    <div className="badge-row">
      {badges.map((b) => (
        <span key={b.label} className={`badge${b.ok ? " ok" : ""}`}>
          {b.label}
        </span>
      ))}
    </div>
  );
}
