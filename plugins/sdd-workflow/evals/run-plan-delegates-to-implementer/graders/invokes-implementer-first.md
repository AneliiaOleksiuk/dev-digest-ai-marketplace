---
type: tool_used
tool: Agent
input_match: "(sdd-workflow:)?implementer"
min: 1
target: trace
---

Phase 1 of `run-plan` must invoke `implementer` with the plan's content
inlined — the first sub-agent spawned in this chain.
