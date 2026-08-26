import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { marked } from "marked";
import FavoriteButton from "../components/FavoriteButton.jsx";
import QualityBadges from "../components/QualityBadges.jsx";
import InstallBlock from "../components/InstallBlock.jsx";
import RelatedList from "../components/RelatedList.jsx";
import NotFoundPage from "./NotFoundPage.jsx";

export default function DetailPage({ itemsById, isFavorite, onToggleFavorite }) {
  const { id } = useParams();
  const item = itemsById.get(decodeURIComponent(id));

  const html = useMemo(() => (item ? marked.parse(item.body || "") : ""), [item]);

  if (!item) return <NotFoundPage />;

  return (
    <div>
      <Link className="back-link" to="/">
        ← Back to catalog
      </Link>

      <div className="detail-header">
        <h1 className="detail-title">{item.title}</h1>
        <FavoriteButton
          active={isFavorite(item.id)}
          onToggle={() => onToggleFavorite(item.id)}
          label={item.title}
        />
      </div>
      <div className="detail-sub">
        {item.type} · {item.type === "plugin" ? "plugin" : `part of ${item.plugin}`} · v
        {item.pluginVersion}
        {item.author ? ` · by ${item.author}` : ""}
      </div>

      <QualityBadges quality={item.quality} />

      <InstallBlock item={item} />

      {/* Content sourced from this repo's own SKILL.md/README files, not user input. */}
      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />

      <RelatedList relatedIds={item.related} itemsById={itemsById} />
    </div>
  );
}
