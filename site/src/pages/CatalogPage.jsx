import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar.jsx";
import FilterBar from "../components/FilterBar.jsx";
import CardGrid from "../components/CardGrid.jsx";
import { createSearchIndex, searchItems } from "../lib/search.js";

export default function CatalogPage({ items, isFavorite, onToggleFavorite }) {
  const [params, setParams] = useSearchParams();

  const query = params.get("q") || "";
  const type = params.get("type") || "all";
  const tag = params.get("tag") || "all";
  const sort = params.get("sort") || "relevance";
  const favoritesOnly = params.get("fav") === "1";

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === "all" || value === "" || value === false) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const fuse = useMemo(() => createSearchIndex(items), [items]);

  const allTags = useMemo(() => {
    const set = new Set();
    for (const item of items) for (const t of item.tags || []) set.add(t);
    return [...set].sort();
  }, [items]);

  const results = useMemo(() => {
    let list = searchItems(fuse, items, query);
    if (type !== "all") list = list.filter((i) => i.type === type);
    if (tag !== "all") list = list.filter((i) => i.tags?.includes(tag));
    if (favoritesOnly) list = list.filter((i) => isFavorite(i.id));

    if (sort === "updated") {
      list = [...list].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    } else if (sort === "name") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [fuse, items, query, type, tag, favoritesOnly, sort, isFavorite]);

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p>No plugins published yet.</p>
        <p>Once one is registered in marketplace.json, it shows up here automatically.</p>
      </div>
    );
  }

  return (
    <div>
      <SearchBar value={query} onChange={(v) => setParam("q", v)} />
      <FilterBar
        activeType={type}
        onTypeChange={(v) => setParam("type", v)}
        tags={allTags}
        activeTag={tag}
        onTagChange={(v) => setParam("tag", v)}
        sort={sort}
        onSortChange={(v) => setParam("sort", v)}
        favoritesOnly={favoritesOnly}
        onFavoritesOnlyChange={(v) => setParam("fav", v ? "1" : "")}
      />
      <div className="result-count">
        {results.length} result{results.length === 1 ? "" : "s"}
      </div>
      <CardGrid items={results} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
    </div>
  );
}
