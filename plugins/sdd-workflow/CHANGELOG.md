# Changelog

All notable changes to `sdd-workflow` are recorded here. Version lives in
`.claude-plugin/plugin.json`; this file is human-readable release notes
only — see [docs/RELEASES.md](../../docs/RELEASES.md) for the versioning
policy.

## 0.1.0 — 2026-08-27

Initial release. Six agents (`spec-creator`, `implementation-planner`,
`implementer`, `test-writer`, `plan-verifier`, `doc-writer`), the
`run-plan` orchestrator, the manual `run` retro skill, and six
stack-agnostic domain skills (`backend-service-patterns`,
`frontend-component-patterns`, `typed-contracts`, `security-baseline`,
`diagramming`, `session-insights-log`). Depends on `shared-skills` for
`engineering-paved-path`.
