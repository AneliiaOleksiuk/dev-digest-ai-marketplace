---
type: tool_used
tool: Skill
input_match: '"skill"\s*:\s*"(?:[\w-]+:)?sdd-workflow:run"'
min: 1
target: trace
withOnly: true
scored: true
---

An explicit `/run` request must actually invoke the `run` skill — the
counterpart to `retro-not-triggered-automatically/`'s negative check.
