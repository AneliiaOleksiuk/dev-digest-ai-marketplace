# dev-digest-ai-marketplace

Private Claude Code plugin marketplace.

## Structure

```
.claude-plugin/marketplace.json   # marketplace catalog (required)
plugins/<plugin-name>/            # one folder per plugin
  .claude-plugin/plugin.json      # plugin manifest
  skills/<skill-name>/SKILL.md    # model-invoked skills
  commands/                       # optional slash commands
  agents/                         # optional custom agents
  hooks/hooks.json                # optional hooks
```

## Adding a plugin

1. Create `plugins/<plugin-name>/.claude-plugin/plugin.json`:
   ```json
   {
     "name": "<plugin-name>",
     "description": "What it does",
     "version": "0.1.0",
     "author": { "name": "AneliiaOleksiuk" }
   }
   ```
2. Add its skills/commands/agents under `plugins/<plugin-name>/`.
3. Register it in `.claude-plugin/marketplace.json`:
   ```json
   { "name": "<plugin-name>", "source": "./plugins/<plugin-name>" }
   ```

## Testing locally

```bash
node scripts/validate-marketplace.mjs
claude plugin validate .
claude plugin marketplace add ./dev-digest-ai-marketplace
claude plugin install <plugin-name>@dev-digest-ai-marketplace
```

## Docs

- [CONTRIBUTING.md](CONTRIBUTING.md) — how to safely add/update plugins
- [docs/PLUGIN-GUIDELINES.md](docs/PLUGIN-GUIDELINES.md) — plugin structure, manifest
- [docs/SECURITY.md](docs/SECURITY.md) — permissions, secrets policy
- [docs/RELEASES.md](docs/RELEASES.md) — SemVer, update, rollback
- [docs/MARKETPLACE-RESEARCH.md](docs/MARKETPLACE-RESEARCH.md) — research notes on Claude Code docs (temporary, will be removed once the first plugin exists)
