---
type: tool_used
tool: Agent
input_match: "(sdd-workflow:)?(spec-creator|implementation-planner)"
min: 0
max: 0
target: trace
---

`run-plan`'s own description states it never invokes `spec-creator` or
`implementation-planner` — both are run manually, outside this skill,
before it starts. The plan already exists and is already approved.
