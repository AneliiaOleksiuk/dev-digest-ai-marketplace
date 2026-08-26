# Security Policy

## Permissions

- A plugin declares only the `hooks`/`mcpServers`/`lspServers` it actually needs for its
  functionality — least privilege.
- Hooks (`hooks/hooks.json`) that run commands (`type: "command"`) get a manual review
  before merge: confirm the command doesn't execute unvalidated input and doesn't reach
  the network unnecessarily.
- `command`-type sources (`source.source == "command"`) are disabled by default for this
  marketplace until the author explicitly justifies the need in the PR description.

## Secrets policy

- No real tokens/keys are ever committed — not in `plugin.json`, not in `hooks.json`, not
  in test fixtures.
- Authentication to private archives (`headers`/`headersHelper`) goes through environment
  variables or an external secrets manager; a `headersHelper` script prints the token, it
  never stores it in a file.
- If a secret accidentally lands in a commit, rotating the key is mandatory — a
  `git revert` alone is not enough.

## Path safety

- No plugin file (`plugin.json`, `hooks.json`, `mcpServers` config) may contain an
  absolute local filesystem path (e.g. `C:\Users\...`, `/home/...`). Absolute paths leak
  machine-specific information and break on every other machine.
- Use `${CLAUDE_PLUGIN_ROOT}` for paths to files inside the plugin, and
  `${CLAUDE_PLUGIN_DATA}` for persistent data — never a hardcoded path.
- This is checked manually in review; `scripts/validate-marketplace.mjs` does not
  currently scan file contents for absolute paths.

## Script review

Before accepting a plugin with scripts (`scripts/`, command hooks, `mcpServers.command`):

1. Read the full contents of the script — don't trust it based on the filename.
2. Confirm the script doesn't download and execute code from the network at runtime.
3. Run `node scripts/validate-marketplace.mjs` and `claude plugin validate .` locally.
4. For org distribution, confirm there is no top-level `bin/` directory (forbidden;
   executables go in `scripts/`).

## Reporting a vulnerability

Report security issues in plugins from this marketplace privately to the repository
owner (see `CODEOWNERS`), not via a public issue.

## After a dangerous release

If a published plugin version turns out to be unsafe (leaked secret, malicious/broken
script, unreviewed `command` source that shipped anyway):

1. Rotate any credential that may have been exposed immediately — do this before
   anything else, a `git revert` does not invalidate a leaked secret.
2. Roll back the affected plugin to the last known-safe version (see
   [RELEASES.md — Rollback](./RELEASES.md#rollback), or run
   `node scripts/rollback.mjs revert <plugin-name> --yes`).
3. If the plugin cannot be made safe quickly, remove it from discovery via `renames`
   (`"plugin-name": null`) rather than leaving a broken entry installable — or run
   `node scripts/rollback.mjs disable <plugin-name>`.
4. Bump a new `PATCH`/`MAJOR` version once fixed, per SemVer, so cached installs pick up
   the fix on next update.
5. Note what happened and the fix in the PR that resolves it — this repo has no separate
   incident log, the PR history is the record.
