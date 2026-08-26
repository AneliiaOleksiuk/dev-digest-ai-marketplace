# Contributing

## Plugin folder structure

```
plugins/<plugin-name>/
├── .claude-plugin/
│   └── plugin.json        # only this file goes inside .claude-plugin/
├── skills/<skill-name>/SKILL.md
├── commands/*.md           # optional
├── agents/*.md              # optional
└── hooks/hooks.json         # optional
```

`<plugin-name>` is kebab-case and matches `name` in `plugin.json` and in the
`plugins[]` entry in `.claude-plugin/marketplace.json`. Full schema reference:
[docs/PLUGIN-GUIDELINES.md](docs/PLUGIN-GUIDELINES.md).

## Required plugin.json fields

```json
{
  "name": "<plugin-name>",
  "description": "What the plugin does, in one sentence",
  "version": "0.1.0",
  "author": { "name": "..." }
}
```

## Dependency rules

- A plugin must not reference files outside its own folder.
- External npm dependencies only when distributed via `source: npm`; file-based sources
  (`./plugins/...`) keep zero dependencies or vendor the code.
- Paths in `mcpServers`/`hooks` go through `${CLAUDE_PLUGIN_ROOT}` — never an absolute
  local path (see [docs/SECURITY.md](docs/SECURITY.md)).

## Add a new plugin

1. Create `plugins/<plugin-name>/.claude-plugin/plugin.json` with the fields above.
2. Add `skills/`/`commands/`/`agents/` as needed at the plugin root (not inside
   `.claude-plugin/`).
3. Register it in `.claude-plugin/marketplace.json`:
   ```json
   { "name": "<plugin-name>", "source": "./plugins/<plugin-name>" }
   ```
4. Run the checks below.
5. Open a PR — checklist below, also pre-filled by `.github/pull_request_template.md`.

## Update an existing plugin

Bump `version` per SemVer ([docs/RELEASES.md](docs/RELEASES.md)), set in exactly one
place — either `plugin.json` or the marketplace entry, never both.

## Rename or remove a plugin

Never delete or retroactively edit an existing entry in `plugins[]`. Add an entry to
`renames` instead (append-only):

```json
"renames": {
  "old-plugin-name": "new-plugin-name",
  "removed-plugin": null
}
```

## Checks to run before opening a PR

```bash
node scripts/validate-marketplace.mjs
claude plugin validate .
claude --plugin-dir ./plugins/<plugin-name>
```

## Pull request checklist

- [ ] `node scripts/validate-marketplace.mjs` passes locally
- [ ] `claude plugin validate .` passes locally
- [ ] Plugin tested via `claude --plugin-dir ./plugins/<name>`
- [ ] `plugin.json` has `name`, `description`, `version`, `author`
- [ ] Version bumped per SemVer, set in exactly one place
- [ ] No secrets/tokens and no absolute local paths in the diff (see
      [docs/SECURITY.md](docs/SECURITY.md))
- [ ] Scripts/hooks manually reviewed if added/changed
- [ ] Docs updated if needed
