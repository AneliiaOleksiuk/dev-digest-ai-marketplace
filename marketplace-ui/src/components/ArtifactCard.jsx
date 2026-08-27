import { Link } from "react-router-dom";
import { KindPill } from "./KindBadge.jsx";
import CopyButton from "./CopyButton.jsx";
import { entryPath } from "../lib/routes.js";

export default function ArtifactCard({ item }) {
  const meta = item.type === "plugin" ? item.author : `${item.plugin} · ${item.author}`;

  return (
    <div className="card">
      <div className="card-body">
        <div className="card-top">
          <KindPill kind={item.type} />
          <span className="card-version">v{item.pluginVersion}</span>
        </div>

        <Link className="card-title" to={entryPath(item)}>
          {item.title}
        </Link>
        <p className="card-desc">{item.description}</p>

        {item.tags?.length > 0 && (
          <div className="card-tags">
            {item.tags.slice(0, 3).map((t) => (
              <span key={t} className="card-tag">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="card-footer">
        <span className="card-meta">{meta}</span>
        <div className="card-actions">
          <CopyButton text={item.installCommand} id={`c:${item.id}`} label="Copy install" />
          <Link className="open-btn" to={entryPath(item)}>
            Open
          </Link>
        </div>
      </div>
    </div>
  );
}
