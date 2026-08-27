// Small colored circle used in facets/stats/browse rows and the palette.
export function KindDot({ kind, size = "" }) {
  return <span className={`kind-dot ${size}`} style={{ background: `var(--kind-${kind})` }} />;
}

// Pill badge used on cards and detail headers.
export function KindPill({ kind }) {
  return (
    <span
      className="kind-pill"
      style={{
        color: `var(--kind-${kind})`,
        background: `color-mix(in oklab, var(--kind-${kind}) 15%, transparent)`,
      }}
    >
      {kind}
    </span>
  );
}
