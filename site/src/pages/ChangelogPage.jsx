import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { itemPath } from "../lib/routes.js";

function formatDate(iso) {
  if (!iso) return "unknown date";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function ChangelogPage({ changelog, itemsById }) {
  const [pluginFilter, setPluginFilter] = useState("all");

  const plugins = useMemo(() => [...new Set(changelog.map((c) => c.plugin))].sort(), [changelog]);
  const entries = pluginFilter === "all" ? changelog : changelog.filter((c) => c.plugin === pluginFilter);

  return (
    <div>
      <h1 className="detail-title">Changelog</h1>
      <div className="detail-sub">Version history across all plugins, newest first.</div>

      <div className="filter-bar">
        <span className="select">
          Plugin:
          <select value={pluginFilter} onChange={(e) => setPluginFilter(e.target.value)}>
            <option value="all">All</option>
            {plugins.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">No releases yet.</div>
      ) : (
        <ul className="changelog-list">
          {entries.map((e) => {
            const pluginItem = itemsById.get(e.plugin);
            return (
              <li key={`${e.plugin}-${e.version}`} className="changelog-item">
                <div className="changelog-date">{formatDate(e.date)}</div>
                <div className="changelog-title">
                  {pluginItem ? <Link to={itemPath(pluginItem.id)}>{e.title}</Link> : e.title}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
