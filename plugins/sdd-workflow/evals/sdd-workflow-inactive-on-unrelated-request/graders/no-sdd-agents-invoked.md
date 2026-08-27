---
type: tool_used
tool: Agent
input_match: "(sdd-workflow:)?(spec-creator|implementation-planner|implementer|test-writer|plan-verifier|doc-writer)"
min: 0
max: 0
target: trace
---

An explanation request has no feature to spec, plan, or implement — none
of the six `sdd-workflow` agents proactive-triggers on "Use PROACTIVELY
before..." apply here. Firing any of them anyway would be the plugin
over-activating on an irrelevant prompt.
