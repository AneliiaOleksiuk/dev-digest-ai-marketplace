export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar">
      <input
        type="search"
        placeholder='Search by keyword, e.g. "changelog" or "security review"'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search plugins, skills, commands, and agents"
      />
    </div>
  );
}
