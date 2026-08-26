## What changed

<!-- new plugin / version bump / catalog structure change -->

## Checklist

- [ ] `node scripts/validate-marketplace.mjs` passes locally
- [ ] `claude plugin validate .` passes locally
- [ ] Plugin tested via `claude --plugin-dir ./plugins/<name>`
- [ ] `plugin.json` has `name`, `description`, `version`, `author`
- [ ] Version bumped per SemVer (see `docs/RELEASES.md`), set in exactly one place
- [ ] No secrets/tokens and no absolute local paths in the diff (see `docs/SECURITY.md`)
- [ ] Scripts/hooks manually reviewed if added/changed
- [ ] Docs (`README.md` / `docs/PLUGIN-GUIDELINES.md`) updated if needed
