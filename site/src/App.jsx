import { useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import CatalogPage from "./pages/CatalogPage.jsx";
import DetailPage from "./pages/DetailPage.jsx";
import ChangelogPage from "./pages/ChangelogPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import { useCatalog } from "./hooks/useCatalog.js";
import { useFavorites } from "./hooks/useFavorites.js";

export default function App() {
  const { items, changelog, error, loading } = useCatalog();
  const { toggleFavorite, isFavorite } = useFavorites();

  const itemsById = useMemo(() => new Map((items || []).map((i) => [i.id, i])), [items]);

  return (
    <div className="app-shell">
      <Header />

      {error && (
        <div className="empty-state">
          Couldn't load the catalog data ({error}). Run{" "}
          <code>npm run build:index</code> (from <code>site/</code>) first.
        </div>
      )}
      {loading && !error && <div className="empty-state">Loading catalog…</div>}

      {items && (
        <Routes>
          <Route
            path="/"
            element={
              <CatalogPage items={items} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />
            }
          />
          <Route
            path="/item/:id"
            element={
              <DetailPage
                itemsById={itemsById}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
              />
            }
          />
          <Route
            path="/changelog"
            element={<ChangelogPage changelog={changelog} itemsById={itemsById} />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      )}
    </div>
  );
}
