import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import SearchInput from "./SearchInput.jsx";
import { useTheme } from "../hooks/useTheme.js";
import { homePath, searchPath } from "../lib/routes.js";
import { MARKETPLACE_SHORT_NAME, REPO_URL } from "../lib/constants.js";

export default function Header({ onOpenPalette }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const headerQuery = location.pathname === "/search" ? params.get("q") || "" : "";

  return (
    <header className="header">
      <a className="header-brand" href={homePath()} onClick={(e) => { e.preventDefault(); navigate(homePath()); }}>
        <span className="header-mark">◆</span>
        <span className="header-title">Catalog</span>
        <span className="header-pill">{MARKETPLACE_SHORT_NAME}</span>
      </a>

      <div className="header-search">
        <SearchInput
          value={headerQuery}
          onChange={(v) => navigate(searchPath(v))}
          placeholder="Search the catalog…"
        />
      </div>

      <div className="header-actions">
        <button className="icon-button" onClick={onOpenPalette}>
          ⌘K
        </button>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? "☾" : "☀"}
        </button>
        <a className="header-github" href={REPO_URL} target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
      </div>
    </header>
  );
}
