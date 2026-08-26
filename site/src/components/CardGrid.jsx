import ArtifactCard from "./ArtifactCard.jsx";

export default function CardGrid({ items, isFavorite, onToggleFavorite }) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        No matches. Try a broader keyword or clear a filter.
      </div>
    );
  }

  return (
    <div className="card-grid">
      {items.map((item) => (
        <ArtifactCard
          key={item.id}
          item={item}
          isFavorite={isFavorite(item.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
