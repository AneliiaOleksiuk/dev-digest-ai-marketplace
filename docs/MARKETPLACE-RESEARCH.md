# Marketplace Research

Notes from researching the official Claude Code documentation (code.claude.com/docs/en/plugin-marketplaces)
and web practices for building plugin marketplaces. Source of truth for decisions in
`docs/PLUGIN-GUIDELINES.md`, `docs/SECURITY.md`, `docs/RELEASES.md`.

## 1. What is a marketplace

A catalog that aggregates one or more Claude Code plugins: name, owner, version, plugin
list, and where to fetch each one from (`source`). The file must live at
`.claude-plugin/marketplace.json` at the repository root.

## 2. Required repository structure

```
.claude-plugin/marketplace.json     # catalog (required)
plugins/<name>/
  .claude-plugin/plugin.json        # plugin manifest
  skills/<skill>/SKILL.md           # model-invoked skills
  commands/*.md                     # optional
  agents/*.md                       # optional
  hooks/hooks.json                  # optional
  mcpServers/*.json                 # optional
```

`commands/`, `agents/`, `skills/`, `hooks/` always live at the plugin root — NEVER inside
`.claude-plugin/`. Only `plugin.json` goes inside `.claude-plugin/`.

## 3. marketplace.json schema

Required: `name` (kebab-case), `owner.name`, `plugins[]`.
Optional: `description`, `version`, `owner.email/url`, `metadata.pluginRoot`, `renames`,
`allowCrossMarketplaceDependenciesOn`.

Reserved names (impersonate official marketplaces): `claude-code-marketplace`,
`claude-plugins-official`, `anthropic-plugins`, `agent-skills`, `official-claude-plugins`,
and similar.

## 4. Plugin source types

- relative path `"./plugins/name"` — only works when the marketplace is added via git;
  breaks when added via a direct URL to `marketplace.json`;
- `{"source":"github","repo":"owner/repo","ref":"...","sha":"..."}`;
- `{"source":"url","url":"...git"}` — any git host;
- `{"source":"git-subdir","url":"...","path":"..."}` — sparse clone for monorepos;
- `{"source":"npm","package":"@org/pkg"}`;
- `{"source":"archive","url":"...zip","sha256":"..."}` — HTTPS only, max 256 MiB;
- `{"source":"command","command":"..."}` — resolves the path dynamically.

## 5. plugin.json

Minimum: `name`. Recommended: `description`, `version`, `author {name,email}`, `license`,
`keywords`. `strict: true` (default) — `plugin.json` is authoritative; `strict: false` —
the marketplace entry fully defines the components, and `plugin.json` must not duplicate
them.

## 6. Commands

```bash
claude plugin marketplace add owner/repo   # or ./local-path, or a URL
claude plugin install <plugin>@<marketplace>
claude plugin validate .
claude --plugin-dir ./plugins/<name>       # local test without registering in a marketplace
/reload-plugins                            # reload after edits in a session
```

## 7. Key gotchas

- Don't set `version` in both `plugin.json` and the marketplace entry — the stale one
  masks updates.
- Org distribution forbids a top-level `bin/` directory — put executables in `scripts/`.
- Edit `renames` append-only, never modify existing entries.
- Private archive auth (`headers`/`headersHelper`) fails silently on non-HTTPS, a
  cross-origin redirect, or a non-zero exit code from the helper command.

## 8. Repository layout options

- **A — single repo + `plugins/*`** (chosen for this project): simplest for solo/small-team
  use, easy to validate with a single CI job.
- **B — one plugin per repo**, with a separate aggregating marketplace pointing to them via
  `github`/`url`: fits when different people/teams own plugins independently.
- **C — marketplace as a metapackage**: the repo holds only `marketplace.json`, plugins are
  pulled from mixed sources (github/gitlab/npm/archive) — for aggregating an ecosystem of
  different authors.

## Sources

- https://code.claude.com/docs/en/plugin-marketplaces
- https://github.com/anthropics/claude-code/blob/main/.claude-plugin/marketplace.json
