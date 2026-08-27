---
type: tool_used
tool: Skill
input_match: '"skill"\s*:\s*"(?:[\w-]+:)?sdd-workflow:(run-plan|run)"'
min: 0
max: 0
target: trace
---

Same negative check for the plugin's two skills — `run-plan` and the
manual `run` retro should also never fire on an unrelated explanation
request.
