// Shared search box used both in the sticky header (compact) and the Home
// hero (large). `variant="hero"` switches the larger styling.
export default function SearchInput({ value, onChange, onSubmit, placeholder, variant = "" }) {
  return (
    <div className={`search-input-wrap ${variant}`}>
      <span className="search-icon">⌕</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSubmit) onSubmit(e.target.value);
        }}
        placeholder={placeholder}
        aria-label="Search plugins, skills, commands, and agents"
      />
    </div>
  );
}
