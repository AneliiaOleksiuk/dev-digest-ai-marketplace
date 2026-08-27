import ArtifactCard from "./ArtifactCard.jsx";

export default function CardGrid({ items }) {
  if (items.length === 0) {
    return (
      <div className="empty-card">
        <div className="empty-icon">🔍</div>
        <h2>Nothing found</h2>
        <p>Try clearing a filter or broadening your search.</p>
      </div>
    );
  }

  return (
    <div className="card-grid">
      {items.map((item) => (
        <ArtifactCard key={item.id} item={item} />
      ))}
    </div>
  );
}
