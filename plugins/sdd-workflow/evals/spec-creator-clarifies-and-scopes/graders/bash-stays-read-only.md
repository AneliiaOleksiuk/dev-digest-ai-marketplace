---
type: tool_used
tool: Bash
input_match: "^(mkdir|touch|rm|mv|cp|git (commit|add|push|checkout|reset)|>)"
min: 0
max: 0
target: trace
---

Same hard constraint as the sibling case's grader of the same name:
`spec-creator.md` restricts `Bash` to read-only inspection only, even when
the run ends in a `## Blocking questions` stop rather than a `Write`.
