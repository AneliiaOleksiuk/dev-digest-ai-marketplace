# Marketplace UI — Specification

Static, backend-free web UI hosted on GitHub Pages for browsing and searching
everything in this marketplace: plugins, skills, commands, agents, hooks.

## 1. Goals

- Let a user describe a need in plain keywords ("I need a skill for X") and get
  back matching plugins/skills/agents/commands as cards.
- Give visibility into the full catalog without requiring `claude plugin`
  CLI commands just to browse.
- Work entirely as static files — no server, no database, no auth backend.

## 2. Constraints

- **No backend.** GitHub Pages serves static files only. Anything that looks
  like "search the repo" must actually be "search a pre-built index."
- **Hosting decision (confirmed):** the repo and the Pages site are both
  public. No access-control layer is in scope for this spec.
- **Source of truth stays the repo.** The UI never edits marketplace data; it
  only reads what the build produced from `plugins/**` and `.claude-plugin/marketplace.json`.

## 3. Architecture

```
plugins/**, marketplace.json          (source of truth, edited via PR)
        │
        ▼  (GitHub Action, on push to main)
scripts/build-index.mjs               (new script)
        │
        ▼
site/data/search-index.json           (generated, committed or build-artifact)
site/data/plugins/<name>.json         (per-plugin detail data)
        │
        ▼  (static site generator, e.g. Eleventy/Astro — see §9)
site/dist/**                          (static HTML/CSS/JS)
        │
        ▼  (GitHub Action: actions/deploy-pages)
GitHub Pages (public)
```

Two build steps, both CI-only, never run by hand against production data:

1. **Index generation** — walks `plugins/**`, reads `plugin.json`,
   `skills/*/SKILL.md` frontmatter + body, `commands/*.md`, `agents/*.md`,
   plugin-level `README.md`, and emits the JSON described in §4.
2. **Site generation** — turns that JSON into static pages (search page,
   one detail page per plugin/skill/agent/command) plus the client-side
   search bundle.

Re-uses `scripts/validate-marketplace.mjs` as a pre-step: the index build
fails the whole pipeline if validation fails, so a broken manifest never
reaches the public site.

## 4. Data model

### 4.1 `search-index.json` (one array, one entry per artifact)

```json
{
  "id": "dev-digest-toolkit/skills/changelog-writer",
  "type": "skill",
  "plugin": "dev-digest-toolkit",
  "pluginVersion": "0.3.1",
  "name": "changelog-writer",
  "title": "Changelog Writer",
  "description": "Generates a changelog entry from a PR diff.",
  "tags": ["writing", "release", "automation"],
  "author": "AneliiaOleksiuk",
  "body": "<plain-text extract of SKILL.md for full-text search>",
  "updatedAt": "2026-08-12T00:00:00Z",
  "installCommand": "claude plugin install dev-digest-toolkit@dev-digest-ai-marketplace",
  "detailUrl": "/plugins/dev-digest-toolkit/skills/changelog-writer/",
  "quality": {
    "validated": true,
    "hasExamples": true,
    "hasHooks": false
  }
}
```

- `type`: `"plugin" | "skill" | "command" | "agent"`.
- `tags`: sourced from an (to be added) optional `tags` array in `plugin.json`
  and in SKILL.md/command/agent frontmatter. Until authors add tags, fall
  back to `[]` — search still works via full-text on `name`/`description`/`body`.
- `updatedAt`: taken from `git log -1 --format=%cI -- <path>` at build time
  (no backend needed, git history is already the source of truth).
- `quality`: computed from `validate-marketplace.mjs` output + presence
  checks (e.g., an `examples/` folder, a non-empty `hooks/hooks.json`).

### 4.2 Per-plugin detail JSON

One file per plugin (`site/data/plugins/<plugin-name>.json`) with the full
manifest, rendered README, and the list of its skills/commands/agents/hooks
with their full bodies — this is what powers detail pages without re-parsing
markdown client-side.

### 4.3 Plugin/skill/command/agent authors add metadata via:

- `plugin.json`: optional `tags: string[]`, optional `homepage`/`repository`.
- SKILL.md / command / agent markdown: YAML frontmatter with `tags:` and a
  one-line `summary:` if the first paragraph isn't a good card description.

This is additive — nothing existing breaks if an author omits it.

## 5. Search

### 5.1 Engine

Recommendation: **Fuse.js** (pure client-side fuzzy search over the JSON
index, no build-time indexing step of its own, small enough to ship as a
static bundle).

- Weighted fields: `name`/`title` (highest) > `description` > `tags` >
  `body` (lowest, catches "search by content" cases like "мені треба скіл
  для X").
- Fuzzy matching so typos and partial keyword overlap still surface results.
- If the index grows large enough that shipping `search-index.json` in full
  becomes a real payload problem, revisit with **Pagefind** (indexes at
  build time, ships a small WASM search runtime, built for exactly this
  static-site case) — not needed for the current repo size, noted here so
  it's a deliberate later swap, not a redesign.

### 5.2 Behavior

- Search box on the landing page, debounced (~200ms) live results as you
  type — no submit button required.
- Empty query shows all artifacts (respecting active filters), so the page
  doubles as a browsable catalog.
- Query and active filters are reflected in the URL (`?q=...&type=skill&tag=writing`)
  so results are shareable/bookmarkable without any backend.

### 5.3 Filters & sorting

- Filter chips: artifact type, tag, plugin, author — multi-select, AND
  between categories / OR within a category.
- Sort: Relevance (default when there's a query) · Recently updated ·
  Name (A–Z).

## 6. UI surfaces

### 6.1 Catalog / search page (`/`)

- Search box + filter chips + sort control.
- Result cards: type badge, name, plugin it belongs to, one-line
  description, tags, "Install" button (copies `installCommand`).
- Empty-state copy when a query matches nothing, with a suggestion to
  broaden the search or browse by tag.

### 6.2 Detail page (`/plugins/<plugin>/…`)

- Full rendered README/SKILL.md content.
- Manifest info: version, author, quality badges (§8.3).
- Copy-to-clipboard install command block (§8.5).
- "Related" section (§8.2).

### 6.3 Changelog page (`/changelog/`)

Aggregated view described in §8.4.

## 7. Non-functional requirements

- Works with JavaScript disabled degraded but not broken: server-rendered
  (build-time) catalog listing is still present in the HTML; live search/
  filtering is a progressive enhancement.
- No analytics/telemetry beyond what GitHub Pages provides by default —
  there's no backend to send events to, and none is being added.
- Reasonably fast on a large-ish catalog: target sub-100ms perceived search
  latency for a few hundred artifacts client-side.
- Basic accessibility: keyboard-navigable search/filter controls, semantic
  headings, sufficient color contrast in both light and dark themes.

## 8. Additional features (all in scope for v1, per decision)

### 8.1 Favorites

- `localStorage`-backed list of favorited artifact `id`s, per browser/device
  (no accounts, no sync — this is a static site, not a backend).
- "My Favorites" view filters the catalog to that list client-side.

### 8.2 Related / similar artifacts

- Computed at **build time**: for each artifact, the N artifacts with the
  highest tag overlap (falling back to same-plugin siblings if no tags are
  set yet). Stored directly in the per-plugin detail JSON — zero client-side
  computation needed.

### 8.3 Quality badges

- Computed at build time from `validate-marketplace.mjs` plus presence
  checks: "Validated", "Has examples", "Has hooks", "SemVer'd". Rendered as
  small badges on cards and detail pages. Purely informational, not a gate.

### 8.4 Changelog / Releases page

- Aggregates `docs/RELEASES.md` with version bumps detected by diffing
  `plugin.json` `version` fields across git history at build time.
- One chronological feed, filterable by plugin.

### 8.5 Getting-started / install generator

- Every detail page renders the exact `claude plugin marketplace add …` +
  `claude plugin install …@dev-digest-ai-marketplace` commands for that
  specific plugin, with a copy-to-clipboard button — removes the "how do I
  actually install this" friction the README currently requires reading.

### 8.6 Theme toggle

- Dark-first: the app defaults to dark regardless of OS preference. Light
  is available via a toggle, persisted in `localStorage`.

## 9. Suggested stack

- **Static site generator:** Eleventy or Astro, fed by the JSON in §4 —
  gives real, crawlable/SEO-able detail pages per artifact instead of a
  single-page client-rendered app, while still supporting the interactive
  search widget as an island of JS.
- **Search:** Fuse.js (§5.1).
- **Hosting/CI:** GitHub Actions running `validate-marketplace.mjs` →
  `build-index.mjs` → site build → `actions/deploy-pages`.
- No framework runtime dependency is required at request time — everything
  ships as static HTML/CSS/JS, consistent with the "zero dependencies for
  file-based plugins" rule already in `docs/PLUGIN-GUIDELINES.md`.

## 10. Explicitly out of scope

Things that would need a real backend and are therefore not part of this
spec: user accounts, cross-device favorites/sync, comments or ratings,
server-side analytics/usage stats, live GitHub API calls requiring auth
(e.g., private repo stats), any form of write access from the UI back into
the repo.

## 11. Open items — resolved in the prototype

- **Tag taxonomy:** freeform (`plugin.json`/frontmatter `tags: []`), not a
  controlled list. Revisit if the tag dropdown gets noisy.
- **Generated data:** `site/public/data/*.json` is gitignored and built
  fresh in CI (and locally via `predev`/`prebuild`) — never committed.
- **Related items:** capped at 3, tag-overlap score plus a same-plugin
  bonus, computed once in `build-index.mjs`.
- **Data shape:** implemented as a single `search-index.json` (not split
  into per-plugin detail files as originally sketched in §4.2) — simpler
  for the current catalog size; revisit only if payload size becomes a
  real problem (see §5.1's Pagefind note).
- **Real data only:** `build-index.mjs` indexes exactly the plugins
  registered in `marketplace.json` `plugins[]` (matching
  `validate-marketplace.mjs`'s own notion of "real") — a folder under
  `plugins/` that isn't registered there is never picked up. The bundled
  fixture in `site/src/data/sample-index.json` is used only when the
  script is explicitly run with `--sample` (`npm run dev:sample`); a plain
  build or `npm run dev` renders an empty catalog until real plugins exist,
  never placeholder ones.

## 12. Prototype

Implemented in [`site/`](../site/) — a static React (Vite) app; see
[`site/README.md`](../site/README.md) for how to run it locally and how it
deploys. `scripts/build-index.mjs`, `scripts/release.mjs`, and
`scripts/rollback.mjs` live alongside `scripts/validate-marketplace.mjs` at
the repo root.
