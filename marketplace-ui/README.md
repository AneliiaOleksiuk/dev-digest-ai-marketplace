# Marketplace UI

A static React app (Vite + React Router + Fuse.js) that lets you search and
browse everything registered in `../.claude-plugin/marketplace.json` —
plugins, skills, commands, agents. No backend: everything it shows comes
from a JSON index generated at build time by `../scripts/build-index.mjs`.

Full design rationale: [`../docs/MARKETPLACE-UI-SPEC.md`](../docs/MARKETPLACE-UI-SPEC.md).

Lives in its own top-level folder, deliberately separate from `../plugins/` and the
rest of the marketplace source — this app's `node_modules`/build output never mix
with plugin content.

## Local development

```bash
cd marketplace-ui
npm install
npm run dev
```

`npm run dev` regenerates `public/data/*.json` first (via the `predev` hook)
and then starts the Vite dev server, printing a local URL to open.

Only plugins actually registered in `../.claude-plugin/marketplace.json`
are shown — never anything else. If none are registered yet, the catalog
renders as empty; it never shows fake data by default.

To preview the UI with bundled fixture data while `plugins/` is still empty,
run `npm run dev:sample` instead. This is a dev-only escape hatch: it never
runs in CI or in a real build (`npm run build` never passes `--sample`).

## Building

```bash
cd marketplace-ui
npm run build   # outputs marketplace-ui/dist
npm run preview # serve the production build locally
```

## Deploying

`../.github/workflows/deploy-pages.yml` runs on every push to `main`:
validates the marketplace, builds the index, builds this app, and publishes
`marketplace-ui/dist` to GitHub Pages. No manual deploy step. Enabling Pages itself
(Settings → Pages → Source: GitHub Actions) is a one-time, manual repo
setting — this workflow doesn't turn it on for you.

## Structure

```
src/
  main.jsx, App.jsx        routing, ⌘K palette state, top-level data loading
  context/ToastContext.jsx copy-feedback toast, used app-wide
  hooks/                    useTheme, useCatalog (fetch the JSON index), useCopy
  lib/                      search.js (Fuse.js), routes.js, constants.js, format.js, clipboard.js
  components/               cards, facets, command palette, badges, install block
  pages/                    HomePage, SearchPage, PluginDetailPage, ArtifactDetailPage,
                             WhatsNewPage, GettingStartedPage, NotFoundPage
  data/sample-index.json    fallback demo data — see note above
public/data/                generated JSON, gitignored, never edit by hand
```

## Why React + Vite instead of plain HTML/JS

See "Suggested stack" in the spec. Short version: the catalog needed several
interacting screens (search/filter state, detail views, a command palette) with
shared state (theme, toasts) — React's component model made that
straightforward, and Vite gives a fast local dev server plus a trivial
static `dist/` build for Pages. The tradeoff is a Node/npm toolchain in CI
and a client-rendered app (detail pages aren't independently crawlable by
search engines) — acceptable here since this is an internal catalog, not a
public marketing site.
