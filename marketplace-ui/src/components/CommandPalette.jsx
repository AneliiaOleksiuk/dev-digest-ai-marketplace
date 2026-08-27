import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSearchIndex, searchItems } from "../lib/search.js";
import { entryPath } from "../lib/routes.js";
import { KindDot } from "./KindBadge.jsx";

export default function CommandPalette({ items, onClose }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const fuse = useMemo(() => createSearchIndex(items), [items]);

  const results = (query.trim() ? searchItems(fuse, items, query) : items).slice(0, 8);

  const openEntry = (entry) => {
    navigate(entryPath(entry));
    onClose();
  };

  return (
    <div className="palette-backdrop" onClick={onClose}>
      <div className="palette" onClick={(e) => e.stopPropagation()}>
        <div className="palette-input-row">
          <span className="icon">⌕</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to an artifact…"
          />
          <span className="palette-esc">ESC</span>
        </div>
        <div className="palette-results">
          {results.map((entry) => (
            <button key={entry.id} className="palette-row" onClick={() => openEntry(entry)}>
              <KindDot kind={entry.type} />
              <span className="name">
                {entry.title} <span className="meta">· {entry.type === "plugin" ? "plugin" : entry.plugin}</span>
              </span>
              <span className="kind">{entry.type}</span>
            </button>
          ))}
          {results.length === 0 && <div className="palette-empty">Nothing found</div>}
        </div>
      </div>
    </div>
  );
}
