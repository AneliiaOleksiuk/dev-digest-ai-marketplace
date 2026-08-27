import { useEffect, useState } from "react";

// Reads the data scripts/build-index.mjs generated into public/data/ —
// the only "backend" this static site has.
export function useCatalog() {
  const [items, setItems] = useState(null);
  const [changelog, setChangelog] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const base = import.meta.env.BASE_URL;
    Promise.all([
      fetch(`${base}data/search-index.json`).then((r) => {
        if (!r.ok) throw new Error(`search-index.json: ${r.status}`);
        return r.json();
      }),
      fetch(`${base}data/changelog.json`).then((r) => {
        if (!r.ok) throw new Error(`changelog.json: ${r.status}`);
        return r.json();
      }),
    ])
      .then(([indexData, changelogData]) => {
        setItems(indexData);
        setChangelog(changelogData);
      })
      .catch((e) => setError(e.message));
  }, []);

  return { items, changelog, error, loading: !items && !error };
}
