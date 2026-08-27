---
type: tool_used
tool: Skill
input_match: '"skill"\s*:\s*"(?:[\w-]+:)?sdd-workflow:run"'
min: 0
max: 0
target: trace
---

`run/SKILL.md`'s trigger section: "Never run this skill proactively at
the end of `run-plan` or any other multi-agent chain just because the
chain finished — this stays manual." Nothing in the prompt asked for a
retro, so it must not appear in the trace at all.
