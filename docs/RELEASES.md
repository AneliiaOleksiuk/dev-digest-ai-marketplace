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

`node scripts/release.mjs <plugin-name> <patch|minor|major|X.Y.Z>` automates steps
1–3: it finds whichever single location (`plugin.json` or the marketplace entry)
currently holds the version, bumps it, and runs the validator. It never commits or
opens the PR for you.

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

`node scripts/rollback.mjs` automates the file-based repo case:

- `history <plugin-name>` — lists commits that changed the version field, newest first.
- `revert <plugin-name>` — dry-runs the `git revert` for the most recent one; add
  `--yes` to actually stage it (`git revert --no-commit`) for you to review and commit.
- `disable <plugin-name>` — removes the entry from `plugins[]` and adds
  `renames[<plugin-name>] = null` in one step, for the "remove from discovery
  immediately" case in [SECURITY.md](./SECURITY.md#after-a-dangerous-release).
