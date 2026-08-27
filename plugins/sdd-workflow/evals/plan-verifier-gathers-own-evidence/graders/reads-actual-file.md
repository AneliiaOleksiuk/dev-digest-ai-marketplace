---
type: tool_used
tool: Read
input_match: "greet-mismatch\\.mjs"
min: 1
target: trace
---

`plan-verifier.md`'s "context decoupling rule": evidence comes from the
files themselves and `git diff`/`git show`, never from `implementer`'s or
`test-writer`'s claims, inlined or not. It must open `scripts/greet-mismatch.mjs`
itself rather than accept the Test Report's claim at face value.
