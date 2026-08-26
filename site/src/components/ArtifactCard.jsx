import { Link } from "react-router-dom";
import TypeBadge from "./TypeBadge.jsx";
import FavoriteButton from "./FavoriteButton.jsx";
import CopyButton from "./CopyButton.jsx";
import { itemPath } from "../lib/routes.js";

export default function ArtifactCard({ item, isFavorite, onToggleFavorite }) {
  return (
    <div className="card">
      <div className="card-top">
        <TypeBadge type={item.type} />
        <FavoriteButton
          active={isFavorite}
          onToggle={() => onToggleFavorite(item.id)}
          label={item.title}
        />
      </div>

      <div className="card-title">
        <Link to={itemPath(item.id)}>{item.title}</Link>
      </div>

      <div className="card-desc">{item.description}</div>

      {item.tags?.length > 0 && (
        <div className="tag-row">
          {item.tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="card-meta">
        {item.type === "plugin" ? "Plugin" : `from ${item.plugin}`} · v{item.pluginVersion}
      </div>

      <div className="card-actions">
        <CopyButton text={item.installCommand} className="install-button" label="Install" />
      </div>
    </div>
  );
}
