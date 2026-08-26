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
