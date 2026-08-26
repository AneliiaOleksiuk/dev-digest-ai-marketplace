export default function FavoriteButton({ active, onToggle, label }) {
  return (
    <button
      className={`favorite-button${active ? " active" : ""}`}
      onClick={onToggle}
      aria-pressed={active}
      aria-label={active ? `Remove ${label} from favorites` : `Add ${label} to favorites`}
      title={active ? "Remove from favorites" : "Add to favorites"}
    >
      {active ? "★" : "☆"}
    </button>
  );
}
