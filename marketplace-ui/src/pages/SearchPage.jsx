import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import FacetSidebar from "../components/FacetSidebar.jsx";
import CardGrid from "../components/CardGrid.jsx";
import { createSearchIndex, searchItems } from "../lib/search.js";
import { KIND_LABEL } from "../lib/constants.js";

function parseList(value) {
  return value ? value.split(",").filter(Boolean) : [];
}

export default function SearchPage({ items }) {
  const [params, setParams] = useSearchParams();

  const query = params.get("q") || "";
  const activeKinds = parseList(params.get("type"));
  const activeKeywords = parseList(params.get("tag"));
  const activeAuthor = params.get("author") || null;
  const sort = params.get("sort") || "relevance";

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const fuse = useMemo(() => createSearchIndex(items), [items]);

  const countByKind = useMemo(() => {
    const counts = {};
    for (const item of items) counts[item.type] = (counts[item.type] || 0) + 1;
    return counts;
  }, [items]);

  const kindFacets = useMemo(
    () =>
      Object.keys(KIND_LABEL)
        .filter((kind) => countByKind[kind])
        .map((kind) => ({ kind, label: KIND_LABEL[kind], count: countByKind[kind] })),
    [countByKind]
  );

  const keywordCounts = useMemo(() => {
    const counts = {};
    for (const item of items) for (const tag of item.tags || []) counts[tag] = (counts[tag] || 0) + 1;
    return counts;
  }, [items]);
  const keywordFacets = useMemo(() => Object.keys(keywordCounts).sort(), [keywordCounts]);

  const authorFacets = useMemo(() => {
    const counts = {};
    for (const item of items) if (item.author) counts[item.author] = (counts[item.author] || 0) + 1;
    return Object.keys(counts)
      .sort()
      .map((author) => ({ author, count: counts[author] }));
  }, [items]);

  const results = useMemo(() => {
    let list = searchItems(fuse, items, query);
    if (activeKinds.length) list = list.filter((i) => activeKinds.includes(i.type));
    if (activeKeywords.length) list = list.filter((i) => activeKeywords.some((k) => i.tags?.includes(k)));
    if (activeAuthor) list = list.filter((i) => i.author === activeAuthor);

    if (sort === "updated") {
      list = [...list].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    } else if (sort === "name") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [fuse, items, query, activeKinds, activeKeywords, activeAuthor, sort]);

  const toggleInList = (key, current, value) => {
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setParam(key, next.join(","));
  };

  return (
    <main className="page wide">
      <div className="search-layout">
        <FacetSidebar
          kinds={kindFacets}
          activeKinds={activeKinds}
          onToggleKind={(k) => toggleInList("type", activeKinds, k)}
          keywords={keywordFacets}
          activeKeywords={activeKeywords}
          onToggleKeyword={(k) => toggleInList("tag", activeKeywords, k)}
          authors={authorFacets}
          activeAuthor={activeAuthor}
          onToggleAuthor={(a) => setParam("author", activeAuthor === a ? "" : a)}
          onClear={() => setParams(query ? { q: query } : {}, { replace: true })}
        />

        <section>
          <div className="search-head">
            <div>
              <h1 className="search-heading">{query ? `Results for "${query}"` : "Browse catalog"}</h1>
              <div className="search-count">
                {results.length} artifact{results.length === 1 ? "" : "s"}
              </div>
            </div>
            <label className="sort-control">
              Sort
              <select value={sort} onChange={(e) => setParam("sort", e.target.value)}>
                <option value="relevance">Relevance</option>
                <option value="name">Name</option>
                <option value="updated">Recently updated</option>
              </select>
            </label>
          </div>

          <CardGrid items={results} />
        </section>
      </div>
    </main>
  );
}
