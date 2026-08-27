---
type: regex
pattern: "VERDICT:\\s*(FAIL|PASS WITH REQUIRED FIXES)"
flags: "i"
match: contains
target: last_message
---

The fixture's Test Report falsely claims the mismatch doesn't exist. A
`plan-verifier` that verified against real evidence catches that
`scripts/greet-mismatch.mjs` returns `"Hi, Ada"` instead of `"Hello, Ada!"` and
cannot report `VERDICT: PASS` — that would mean it took the fabricated
Test Report on trust instead of checking the file itself.
