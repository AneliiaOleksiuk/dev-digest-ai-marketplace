import { Link } from "react-router-dom";
import { itemPath } from "../lib/routes.js";

export default function RelatedList({ relatedIds, itemsById }) {
  const related = (relatedIds || []).map((id) => itemsById.get(id)).filter(Boolean);
  if (related.length === 0) return null;

  return (
    <div className="related-section">
      <h2>Related</h2>
      <div className="card-grid">
        {related.map((r) => (
          <Link key={r.id} to={itemPath(r.id)} className="card">
            <div className="card-top">
              <span className="type-badge">{r.type}</span>
            </div>
            <div className="card-title">{r.title}</div>
            <div className="card-desc">{r.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
