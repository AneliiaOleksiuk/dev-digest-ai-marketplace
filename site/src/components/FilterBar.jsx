const TYPES = ["plugin", "skill", "command", "agent"];

export default function FilterBar({
  activeType,
  onTypeChange,
  tags,
  activeTag,
  onTagChange,
  sort,
  onSortChange,
  favoritesOnly,
  onFavoritesOnlyChange,
}) {
  return (
    <div className="filter-bar">
      <button
        className={`chip${activeType === "all" ? " active" : ""}`}
        onClick={() => onTypeChange("all")}
      >
        All types
      </button>
      {TYPES.map((t) => (
        <button
          key={t}
          className={`chip${activeType === t ? " active" : ""}`}
          onClick={() => onTypeChange(t)}
        >
          {t}
        </button>
      ))}

      {tags.length > 0 && (
        <span className="select">
          Tag:
          <select value={activeTag} onChange={(e) => onTagChange(e.target.value)}>
            <option value="all">All</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </span>
      )}

      <span className="select">
        Sort:
        <select value={sort} onChange={(e) => onSortChange(e.target.value)}>
          <option value="relevance">Relevance</option>
          <option value="updated">Recently updated</option>
          <option value="name">Name</option>
        </select>
      </span>

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={favoritesOnly}
          onChange={(e) => onFavoritesOnlyChange(e.target.checked)}
        />{" "}
        Favorites only
      </label>
    </div>
  );
}
