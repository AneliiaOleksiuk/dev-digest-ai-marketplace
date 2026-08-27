# Plugin Guidelines

Rules for any plugin in this marketplace. Schema details live in
[MARKETPLACE-RESEARCH.md](./MARKETPLACE-RESEARCH.md).

## Folder structure

```
plugins/<plugin-name>/
├── .claude-plugin/
│   └── plugin.json        # only this file goes inside .claude-plugin/
├── skills/<skill-name>/SKILL.md
├── commands/*.md           # optional
├── agents/*.md              # optional
└── hooks/hooks.json         # optional
```

`<plugin-name>` is kebab-case and matches the `name` field in `plugin.json` and the
`name` in the `plugins[]` entry in `.claude-plugin/marketplace.json`.

## Required plugin.json fields

```json
{
  "name": "<plugin-name>",
  "description": "What the plugin does, in one sentence",
  "version": "0.1.0",
  "author": { "name": "..." }
}
```

## Optional plugin.json fields (read by the marketplace UI)

- `tags: string[]` — search/filter keywords (see MARKETPLACE-UI-SPEC.md §4).
- `compatibility: string` — free text, e.g. `"Claude Code ≥ 1.4"` or `"beta"`. Shown as
  a badge on the plugin's detail page.
- `dependencies: (string | { name, version?, marketplace? })[]` — other plugins this one
  requires. A bare `"<plugin-name>"` tracks whatever version that plugin's marketplace
  provides; `{ "name": "<plugin-name>", "version": "^1.0.0" }` pins a semver range.
  Claude Code resolves and auto-installs these when the dependent plugin is installed,
  and enforces the range at load time — an unsatisfiable or missing dependency disables
  the plugin with an error (`dependency-unsatisfied`, `range-conflict`,
  `dependency-version-unsatisfied`, or `no-matching-tag`, surfaced via
  `claude plugin list --json`). See
  [Constrain plugin dependency versions](https://code.claude.com/docs/en/plugin-dependencies).
  Also rendered as clickable chips on the detail page.

Skills/commands/agents can set the same optional `invocation` (their `/name` or
`@agent-name`) and `tools: string[]` (declared permissions) in their own frontmatter —
rendered as badges on the artifact's detail page.

## Manifest checklist

- [ ] `name` is unique within the marketplace, kebab-case
- [ ] `description` explains the value, not the implementation
- [ ] `version` follows SemVer (see [RELEASES.md](./RELEASES.md))
- [ ] If the marketplace entry sets `strict: false`, `plugin.json` does **not** declare
      `skills/commands/agents/hooks/mcpServers` (the marketplace entry defines those)

## Dependency requirements

- A plugin must not reference files outside its own folder (the cache only copies that
  folder).
- External npm dependencies are only allowed when the plugin is distributed via
  `source: npm`; for file-based sources (`./plugins/...`) keep zero dependencies or
  vendor the code.
- Paths to executables in `mcpServers`/`hooks` go through `${CLAUDE_PLUGIN_ROOT}`, never
  absolute local paths.

## Before opening a PR

```bash
node scripts/validate-marketplace.mjs
claude plugin validate .
claude --plugin-dir ./plugins/<plugin-name>
```
