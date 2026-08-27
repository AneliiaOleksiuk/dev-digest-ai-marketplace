import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SearchInput from "../components/SearchInput.jsx";
import { KindDot } from "../components/KindBadge.jsx";
import { searchPath, pluginPath, gettingStartedPath } from "../lib/routes.js";
import { formatDate } from "../lib/format.js";
import { KINDS, KIND_LABEL, STATS_KINDS } from "../lib/constants.js";

export default function HomePage({ items, changelog }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const hasCatalog = items.length > 0;

  const countByKind = useMemo(() => {
    const counts = {};
    for (const kind of KINDS) counts[kind] = items.filter((i) => i.type === kind).length;
    return counts;
  }, [items]);

  const heroChips = useMemo(() => {
    const freq = {};
    for (const item of items) for (const tag of item.tags || []) freq[tag] = (freq[tag] || 0) + 1;
    return Object.keys(freq)
      .sort((a, b) => freq[b] - freq[a])
      .slice(0, 7);
  }, [items]);

  const whatsNew = (changelog || []).slice(0, 4);

  const submit = (value) => navigate(searchPath(value));

  if (!hasCatalog) {
    return (
      <main className="page">
        <Hero query={query} setQuery={setQuery} onSubmit={submit} heroChips={heroChips} navigate={navigate} />
        <div className="empty-card">
          <div className="empty-icon">📦</div>
          <h2>Catalog is empty</h2>
          <p>Nothing is registered yet. Add the first plugin and it'll show up here as soon as the index builds.</p>
          <div className="empty-actions">
            <Link className="btn btn-primary" to={gettingStartedPath()}>
              How to start
            </Link>
            <a
              className="btn btn-secondary"
              href="https://github.com/AneliiaOleksiuk/dev-digest-ai-marketplace/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noreferrer"
            >
              CONTRIBUTING.md
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <Hero query={query} setQuery={setQuery} onSubmit={submit} heroChips={heroChips} navigate={navigate} />

      <div className="stats-row">
        {STATS_KINDS.map((kind) => (
          <button key={kind} className="stat-tile" onClick={() => navigate(`/search?type=${kind}`)}>
            <div className="stat-count">{countByKind[kind]}</div>
            <div className="stat-label">{KIND_LABEL[kind]}</div>
          </button>
        ))}
      </div>

      <section className="section">
        <div className="section-head">
          <h2>What's new</h2>
          <Link className="section-link" to="/whats-new">
            See all →
          </Link>
        </div>
        <div>
          {whatsNew.map((r) => (
            <Link key={`${r.plugin}-${r.version}`} className="whats-new-row" to={pluginPath(r.plugin)}>
              <span className="whats-new-version">v{r.version}</span>
              <div className="whats-new-body">
                <div className="whats-new-name">{r.pluginTitle}</div>
                <div className="whats-new-summary">{r.summary}</div>
              </div>
              <span className="whats-new-date">{formatDate(r.date)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Browse by kind</h2>
        </div>
        <div className="browse-row">
          {KINDS.map((kind) => (
            <Link key={kind} className="browse-chip" to={`/search?type=${kind}`}>
              <KindDot kind={kind} />
              <span className="label">{KIND_LABEL[kind]}</span>
              <span className="count">{countByKind[kind]}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function Hero({ query, setQuery, onSubmit, heroChips, navigate }) {
  return (
    <section className="hero">
      <div className="hero-eyebrow">Marketplace of plugins · skills · agents</div>
      <h1>
        Find the artifact you need
        <br />
        and install it with one copy-paste
      </h1>
      <p>Client-side fuzzy search over descriptions, frontmatter, and markdown body. No backend — everything is built in CI.</p>
      <SearchInput
        variant="hero"
        value={query}
        onChange={setQuery}
        onSubmit={onSubmit}
        placeholder='Describe what you need — e.g. "a skill for React refactoring"'
      />
      {heroChips.length > 0 && (
        <div className="hero-chips">
          {heroChips.map((tag) => (
            <button key={tag} className="hero-chip" onClick={() => navigate(`/search?tag=${encodeURIComponent(tag)}`)}>
              #{tag}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
