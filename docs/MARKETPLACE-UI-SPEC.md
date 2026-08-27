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
- **Language: English only.** All UI copy (labels, buttons, empty states,
  headings) ships in English, regardless of the language any internal design
  draft was mocked up in.
- **Separate top-level folder.** The UI app lives in `marketplace-ui/`, a sibling of
  `plugins/`/`docs/`/`scripts/` — not nested inside the marketplace source it reads,
  so its own `node_modules`/build output never mix with plugin content.

## 3. Architecture

```
plugins/**, marketplace.json          (source of truth, edited via PR)
        │
        ▼  (GitHub Action, on push to main)
scripts/build-index.mjs               (new script)
        │
        ▼
marketplace-ui/data/search-index.json           (generated, committed or build-artifact)
marketplace-ui/data/plugins/<name>.json         (per-plugin detail data)
        │
        ▼  (static site generator, e.g. Eleventy/Astro — see §9)
marketplace-ui/dist/**                          (static HTML/CSS/JS)
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
  "invocation": "/changelog-writer",
  "tools": ["Read", "Write"],
  "quality": {
    "validated": true,
    "hasExamples": true,
    "hasHooks": false
  }
}
```

- `type`: `"plugin" | "skill" | "command" | "agent" | "hook" | "mcp"`.
- `tags`: sourced from an (to be added) optional `tags` array in `plugin.json`
  and in SKILL.md/command/agent frontmatter. Until authors add tags, fall
  back to `[]` — search still works via full-text on `name`/`description`/`body`.
- `updatedAt`: taken from `git log -1 --format=%cI -- <path>` at build time
  (no backend needed, git history is already the source of truth).
- `invocation`: the slash-command (`/name`) or `@agent-name` mention syntax
  used to invoke this artifact; empty string for kinds with no direct
  invocation (hooks, MCP tools). Rendered as a badge on cards and detail
  pages.
- `tools`: the permissions/tools an agent or skill declares (`Read`, `Edit`,
  `Bash`, …), rendered as small badges on the artifact detail page. Empty
  array when not applicable (e.g. hooks).
- `quality`: computed from `validate-marketplace.mjs` output + presence
  checks (e.g., an `examples/` folder, a non-empty `hooks/hooks.json`).

At the **plugin** level only, two additional fields:

- `compatibility`: a free-text compatibility string (e.g. `"Claude Code ≥ 1.4"`,
  `"beta"`) sourced from an optional `compatibility` field in `plugin.json`.
  Rendered as a badge next to the version on the plugin detail page.
- `dependencies`: `(string | { name, version?, marketplace? })[]`, sourced from
  an optional `dependencies` array in `plugin.json`. A string entry is
  `"<plugin-name>"` or `"<plugin-name>:<artifact-name>"`; an object entry pins
  a semver range, e.g. `{ "name": "shared-skills", "version": "^1.0.0" }`.
  This is the mechanism for the "some plugins are reusable building blocks
  other plugins depend on" case (see
  [SDD-PLUGINS-SPEC.md §3](./SDD-PLUGINS-SPEC.md)). Claude Code actually
  resolves and auto-installs these (see
  [PLUGIN-GUIDELINES.md](./PLUGIN-GUIDELINES.md)) — the detail page renders
  each entry as a clickable chip linking to the referenced plugin (or
  straight to the referenced artifact's detail page, if the `plugin:artifact`
  string form is used), so a user installing
  `react-tools` sees it points at `engineering-paved-path` and knows to
  install that too.

### 4.2 Per-plugin detail JSON

One file per plugin (`marketplace-ui/data/plugins/<plugin-name>.json`) with the full
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
  `body` (lowest, catches "search by content" cases like "I need a skill
  for X").
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

### 6.0 Header (all pages)

Sticky top bar: logo/mark + "Catalog" wordmark + a small `dev-digest` pill →
persistent search input (syncs with the page's query) → ⌘K button (opens the
command palette, §6.6) → theme toggle (§8.6) → "GitHub ↗" external link.

### 6.1 Home (`/`)

Landing page, distinct from the search-results page (§6.2) — this is what a
user sees before typing anything:

- Hero: eyebrow label, headline, one-line subhead, a large centered search
  input. Submitting/typing routes to Search (§6.2).
- Hero chips: the top ~7 tags across the whole catalog by frequency, each a
  shortcut into Search pre-filtered to that tag.
- **Empty-catalog state** (shown instead of the sections below when the
  index has zero entries): a dashed-border card — "Catalog is empty", one
  line explaining nothing is registered yet, a "How to start" button (→
  Getting Started, §6.7) and a link to `CONTRIBUTING.md`. This is the state
  a fresh/near-fresh marketplace is in most of the time; it must not look
  broken.
- **Stats row**: one clickable tile per artifact kind (plugins / skills /
  agents / commands / MCP) with its count — clicking jumps to Search
  pre-filtered to that kind. Hidden along with the two sections below when
  the catalog is empty.
- **"What's new"**: the 4 most recent changelog entries across all plugins
  (plugin name, version, one-line summary, date), "See all →" to the full
  What's New page (§6.5).
- **"Browse by kind"**: one chip per kind with a color dot + label + count,
  linking into Search filtered to that kind.

### 6.2 Search (`/search`)

Results page, reachable from the header search, hero search, hero chips,
stat tiles, or a direct `?q=` link.

- **Left sidebar, sticky**: facet groups — **Kind** (color dot + label +
  count, multi-select), **Keywords/tags** (pill toggles), **Author**
  (single-select) — plus a "Clear" action. Facets AND together; multiple
  values within one facet group OR together (matches §5.3).
- **Header row**: heading (`Results for "<query>"` or `Browse catalog` when
  there's no query), a result count, and a sort `<select>` (Relevance ·
  Name · Recently updated).
- **Result cards** (grid): kind badge, version, name, two-line-clamped
  description, up to 3 tags, a footer with a meta label (plugin name for
  sub-artifacts, author for plugins) and two actions — "Copy install"
  (copies `installCommand`, swaps its own label to a checkmark state for
  ~2s) and "Open" (→ detail page).
- **No-results state**: dashed-border card, "Nothing found", suggestion to
  clear filters, with a "Clear filters" button.

### 6.3 Plugin detail page (`/plugins/<plugin>/`)

- Back-to-search link, icon, name, version badge, compatibility badge
  (new field, §4.1), description, `author · updated <date>` line.
- Install block: a terminal-styled row showing the exact install command +
  a "Copy" button, plus a "View on GitHub ↗" link (§8.5).
- **"What's inside"**: one group per kind present (skills/agents/commands/
  hooks/mcp), each item a clickable tile showing name + invocation badge +
  one-line description → artifact detail page (§6.4).
- **Dependencies** (new section, only rendered when `plugin.dependencies`
  is non-empty, §4.1): a row of chips, one per dependency, linking to the
  referenced plugin.
- **README**: full rendered plugin README.
- **Changelog**: this plugin's own version history (version, date,
  one-line summary per entry).

### 6.4 Artifact detail page (`/plugins/<plugin>/<kind>/<name>/`)

New page type (previously folded into "detail page" without its own
layout) — one per skill/agent/command/hook/mcp tool:

- Breadcrumb: `Catalog / <Plugin name> / <artifact name>`.
- Kind badge, name, invocation badge (when the artifact has one — hooks and
  MCP tools typically don't).
- One-line description.
- **Tools/permissions** row (only when non-empty, §4.1): a badge per
  declared tool.
- Install block, same pattern as §6.3 (installs the parent plugin — an
  individual skill/agent isn't installed on its own).
- Full documentation body (rendered SKILL.md/agent/command markdown).

### 6.5 What's New page (`/changelog/`)

Full reverse-chronological feed (not just the 4-item teaser from Home): per
entry, version + date (left column) and plugin name + one-line summary
(right). Aggregated view described in §8.4. An RSS/subscribe link is a nice-
to-have, not required for v1.

### 6.6 Command palette (⌘K / Ctrl+K)

New, catalog-wide feature — a modal, fuzzy jump-to-anything list:

- Opens via ⌘K/Ctrl+K anywhere in the app, or the header's "⌘K" button;
  closes on Escape or clicking outside.
- A single text input, autofocused, searching the same index as §6.2 (no
  facets — just relevance-ranked matches, capped to ~8 shown).
- Each row: kind color dot, name, meta label (plugin name, or "plugin" for
  top-level plugin entries), kind label — clicking opens that artifact/
  plugin's detail page and closes the palette.
- Empty-query state lists entries as-is (first 8); no-match state shows a
  simple "Nothing found" line.

### 6.7 Getting Started page

New, linked from the empty-catalog state (§6.1) and worth linking from the
header/footer generally — a 3-step guide, each step numbered, with a title,
one-line description, and a copyable command:

1. Add the marketplace as a source (`claude plugin marketplace add …`).
2. Install a specific plugin (`claude plugin install <name>@…`).
3. Update (`claude plugin marketplace update` to refresh available sources;
   plugin updates are separate — the page calls out the distinction
   explicitly, since it's a recurring point of confusion).

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

## 8. Additional features

### 8.1 Favorites — dropped

Was implemented (`localStorage`-backed list, "Favorites only" filter) but removed when
the UI was rebuilt to match the design draft 1:1 (§13): the draft has no favorites
surface anywhere, and the decision was to match it exactly rather than keep a feature
it doesn't show. Revisit only if there's a concrete reason to bring it back.

### 8.2 Related / similar artifacts — dropped

Was implemented (build-time tag-overlap scoring, rendered on the detail page) but
removed for the same reason as 8.1 — the design draft has no "Related" section.

### 8.3 Quality badges — dropped

Was implemented ("Validated", "Has examples", "Has hooks" pills from
`validate-marketplace.mjs` + presence checks) but removed for the same reason as 8.1 —
the design draft shows a `compatibility` badge instead (§4.1), not quality pills.

### 8.4 Changelog / Releases page

- Aggregates `docs/RELEASES.md` with version bumps detected by diffing
  `plugin.json` `version` fields across git history at build time.
- One chronological feed, filterable by plugin.

### 8.5 Getting-started / install generator

- Every detail page renders the exact `claude plugin marketplace add …` +
  `claude plugin install …@dev-digest-ai-marketplace` commands for that
  specific plugin, with a copy-to-clipboard button — removes the "how do I
  actually install this" friction the README currently requires reading.
- Plus the standalone Getting Started page (§6.7) for the "I haven't
  installed the marketplace at all yet" case.
- **Copy feedback pattern** (applies to every copy button — install
  commands, getting-started steps): the button's own label swaps to a
  checkmark/"Copied" state for ~2s, and a small toast ("Copied to
  clipboard") appears bottom-center for ~1.8s. Purely client-side, no
  backend involved.

### 8.6 Theme toggle

- Dark-first: the app defaults to dark regardless of OS preference. Light
  is available via a toggle, persisted in `localStorage`.
- An accent-color variant (e.g. blue/green/violet/amber) appeared in the
  design draft as a configurable prop — treat as a nice-to-have, not a v1
  requirement, until there's an actual reason to let users pick an accent
  (e.g. per-team branding). Default accent: blue.

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
- **Generated data:** `marketplace-ui/public/data/*.json` is gitignored and built
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
  fixture in `marketplace-ui/src/data/sample-index.json` is used only when the
  script is explicitly run with `--sample` (`npm run dev:sample`); a plain
  build or `npm run dev` renders an empty catalog until real plugins exist,
  never placeholder ones.

## 12. Prototype

Implemented in [`marketplace-ui/`](../marketplace-ui/) — a static React (Vite) app,
deliberately in its own top-level folder rather than nested under `plugins/`, so the
UI's own dependencies/build output never mix with the marketplace source it
displays. See [`marketplace-ui/README.md`](../marketplace-ui/README.md) for how to run
it locally and how it deploys. `scripts/build-index.mjs`, `scripts/release.mjs`, and
`scripts/rollback.mjs` live alongside `scripts/validate-marketplace.mjs` at the repo
root.

## 13. Design draft (2026-08-27) — implemented 1:1

A visual design pass (`Catalog.dc.html`, a Claude Design canvas, drafted in Ukrainian
for internal review — actual UI copy shipped in English per the constraint in §2)
was rebuilt into [`marketplace-ui/`](../marketplace-ui/) as an exact match:

- Home and Search split into two distinct screens/routes — §6.1/§6.2.
- Artifact detail as its own page/layout, separate from plugin detail — §6.4.
- Command palette (⌘K) — §6.6.
- Dedicated Getting Started page — §6.7.
- `compatibility` and `dependencies` fields on plugins, and `invocation`/`tools` on
  artifacts — §4.1.
- Copy-feedback toast — §8.5.

Matching the draft exactly also meant dropping three features the prototype had that
the draft doesn't show at all — Favorites, Related artifacts, Quality badges — see
§8.1–8.3 for why each was removed rather than kept alongside.
