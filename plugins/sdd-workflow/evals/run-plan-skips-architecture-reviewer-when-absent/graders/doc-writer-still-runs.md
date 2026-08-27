---
type: tool_used
tool: Agent
input_match: "(sdd-workflow:)?doc-writer"
min: 1
target: trace
---

Skipping the review gate must not stall the chain — Phase 4 (`doc-writer`)
still runs once Phase 3's `plan-verifier` verdict is `PASS`, exactly as it
would if Phase 3b had run clean.
