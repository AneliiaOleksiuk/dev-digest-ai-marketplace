import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import CommandPalette from "./components/CommandPalette.jsx";
import HomePage from "./pages/HomePage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import PluginDetailPage from "./pages/PluginDetailPage.jsx";
import ArtifactDetailPage from "./pages/ArtifactDetailPage.jsx";
import WhatsNewPage from "./pages/WhatsNewPage.jsx";
import GettingStartedPage from "./pages/GettingStartedPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { useCatalog } from "./hooks/useCatalog.js";

export default function App() {
  const { items, changelog, error, loading } = useCatalog();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      const k = (e.key || "").toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (e.key === "Escape") {
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <ToastProvider>
      <Header onOpenPalette={() => setPaletteOpen(true)} />

      {error && (
        <div className="empty-state">
          Couldn't load the catalog data ({error}). Run{" "}
          <code>npm run build:index</code> (from <code>marketplace-ui/</code>) first.
        </div>
      )}
      {loading && !error && <div className="empty-state">Loading catalog…</div>}

      {items && (
        <Routes>
          <Route path="/" element={<HomePage items={items} changelog={changelog} />} />
          <Route path="/search" element={<SearchPage items={items} />} />
          <Route path="/plugins/:plugin" element={<PluginDetailPage items={items} />} />
          <Route path="/plugins/:plugin/:kind/:name" element={<ArtifactDetailPage items={items} />} />
          <Route path="/whats-new" element={<WhatsNewPage changelog={changelog} />} />
          <Route path="/getting-started" element={<GettingStartedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      )}

      {items && paletteOpen && <CommandPalette items={items} onClose={() => setPaletteOpen(false)} />}
    </ToastProvider>
  );
}
