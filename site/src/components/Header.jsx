import { NavLink } from "react-router-dom";
import { useTheme } from "../hooks/useTheme.js";

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="header-title">
        <NavLink to="/">dev-digest-ai Marketplace</NavLink>
      </div>
      <nav className="header-nav">
        <NavLink to="/" end>
          Catalog
        </NavLink>
        <NavLink to="/changelog">Changelog</NavLink>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? "☾ Dark" : "☀ Light"}
        </button>
      </nav>
    </header>
  );
}
