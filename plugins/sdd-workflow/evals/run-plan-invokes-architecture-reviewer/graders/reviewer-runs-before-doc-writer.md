---
type: tool_order
before: Agent
after: Agent
target: trace
---

Phase ordering per `run-plan/SKILL.md`: `plan-verifier` (Phase 3) →
`architecture-reviewer` (Phase 3b) → `doc-writer` (Phase 4). `doc-writer`
only starts once Phase 3b's findings (if it ran) have no
`critical`/`high` finding — it must not run concurrently with or before
the review gate.

Note: this grader's `before`/`after` fields are both `Agent` because the
grader type filters by tool name, not by subagent identity — if the real
trace format lets `before`/`after` take an `input_match` (as `tool_used`
does), tighten this to `before: architecture-reviewer` /
`after: doc-writer` once a real run confirms the field name.
