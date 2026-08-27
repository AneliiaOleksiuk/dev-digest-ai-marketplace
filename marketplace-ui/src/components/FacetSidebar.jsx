import { KindDot } from "./KindBadge.jsx";

export default function FacetSidebar({
  kinds,
  activeKinds,
  onToggleKind,
  keywords,
  activeKeywords,
  onToggleKeyword,
  authors,
  activeAuthor,
  onToggleAuthor,
  onClear,
}) {
  return (
    <aside className="facets">
      <div className="facets-head">
        <span className="facets-title">Filters</span>
        <button className="facets-clear" onClick={onClear}>
          Clear
        </button>
      </div>

      <div className="facet-group-title">Kind</div>
      <div className="facet-list">
        {kinds.map((f) => {
          const active = activeKinds.includes(f.kind);
          return (
            <button
              key={f.kind}
              className={`facet-row${active ? " active" : ""}`}
              onClick={() => onToggleKind(f.kind)}
            >
              <KindDot kind={f.kind} size="sm" />
              <span className="facet-label">{f.label}</span>
              <span className="facet-count">{f.count}</span>
            </button>
          );
        })}
      </div>

      {keywords.length > 0 && (
        <>
          <div className="facet-group-title">Keywords</div>
          <div className="facet-tags">
            {keywords.map((kw) => {
              const active = activeKeywords.includes(kw);
              return (
                <button
                  key={kw}
                  className={`facet-tag${active ? " active" : ""}`}
                  onClick={() => onToggleKeyword(kw)}
                >
                  {kw}
                </button>
              );
            })}
          </div>
        </>
      )}

      {authors.length > 0 && (
        <>
          <div className="facet-group-title">Author</div>
          <div className="facet-list">
            {authors.map((a) => {
              const active = activeAuthor === a.author;
              return (
                <button
                  key={a.author}
                  className={`facet-row author-row${active ? " active" : ""}`}
                  onClick={() => onToggleAuthor(a.author)}
                >
                  <span className="facet-label">{a.author}</span>
                  <span className="facet-count">{a.count}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </aside>
  );
}
