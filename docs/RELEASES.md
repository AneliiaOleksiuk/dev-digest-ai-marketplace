# Releases

## SemVer

Each plugin is versioned independently using `MAJOR.MINOR.PATCH`:

- **MAJOR** — breaks compatibility (renaming a skill/command, changing input format)
- **MINOR** — new skill/command, backward compatible
- **PATCH** — fix with no behavior change

The version is set **either** in `plugins/<name>/.claude-plugin/plugin.json` **or** in the
`plugins[]` entry in `.claude-plugin/marketplace.json` — never in both (the stale one
would otherwise mask updates).

## Tags

A plugin release living in this same repo (`source: "./plugins/..."`) doesn't need a
separate git tag — the version is fixed directly in JSON and ships in the same
commit/PR.

If a plugin is split into its own repository (`source.source == "github"`), tag it
according to its `version`: `<plugin-name>-v1.2.0`.

## Release channels

For a plugin sourced from an external `github` repo, offer stable and bleeding-edge
variants as two separate marketplace entries pointing at different refs of the same repo:

```json
{
  "plugins": [
    { "name": "formatter-stable", "source": { "source": "github", "repo": "acme/formatter", "ref": "stable" } },
    { "name": "formatter-latest", "source": { "source": "github", "repo": "acme/formatter", "ref": "main" } }
  ]
}
```

Plugins sourced from `./plugins/...` in this same repo have a single channel — there is
only one `main` branch to install from.

## Update

1. Bump `version` in the plugin's `plugin.json`.
2. If the version is duplicated in `marketplace.json`, update it there too.
3. `node scripts/validate-marketplace.mjs`
4. Open a PR using `.github/pull_request_template.md`.

## Rollback

- Plugin in this repo: `git revert` the commit that bumped the version — the previous
  version is immediately active for new installs.
- Plugin from an external repo pinned to a `sha`: restore the previous `sha` in the
  `plugins[]` entry.
- Permanently removing a plugin goes through `renames`, never a plain deletion of the
  entry:

  ```json
  "renames": { "old-plugin-name": null }
  ```
