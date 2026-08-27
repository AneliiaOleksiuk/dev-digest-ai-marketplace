---
type: tool_used
tool: Bash
input_match: "^(mkdir|touch|rm|mv|cp|git (commit|add|push|checkout|reset)|>)"
min: 0
max: 0
target: trace
---

Found by a manual dry run of this exact case (2026-08-27): a run correctly
found no blocking gap and proceeded to `Write`, but got there via
`mkdir -p .sdd/copy-button-error-state` first — a state-changing `Bash`
call. `spec-creator.md`'s hard constraints: "Only use `Bash` for read-only
inspection (`git log`, `git blame`, `git grep`, listing files) — never a
command that changes repository or environment state." `Write` itself
creates any missing parent directories, so there is never a legitimate
reason for this agent to call a mutating command — the directory doesn't
need to exist beforehand.
