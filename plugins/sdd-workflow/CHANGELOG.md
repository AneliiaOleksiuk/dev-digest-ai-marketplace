# Changelog

All notable changes to `sdd-workflow` are recorded here. Version lives in
`.claude-plugin/plugin.json`; this file is human-readable release notes
only — see [docs/RELEASES.md](../../docs/RELEASES.md) for the versioning
policy.

## 1.0.0 — 2026-08-27

First stable release. No behavior change from `0.1.0` — promotes the
initial release to `1.0.0` per the lab's release/tagging requirement,
with `shared-skills`'s dependency constraint tightened to `^1.0.0` to
match. See `COMPATIBILITY.md` for the minimum Claude Code version this
release requires.

## 0.1.0 — 2026-08-27

Initial release. Six agents (`spec-creator`, `implementation-planner`,
`implementer`, `test-writer`, `plan-verifier`, `doc-writer`), the
`run-plan` orchestrator, the manual `run` retro skill, and six
stack-agnostic domain skills (`backend-service-patterns`,
`frontend-component-patterns`, `typed-contracts`, `security-baseline`,
`diagramming`, `session-insights-log`). Depends on `shared-skills` for
`engineering-paved-path`.
