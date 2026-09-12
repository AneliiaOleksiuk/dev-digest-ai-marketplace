---
type: regex
pattern: "Requires human/implementer to apply"
flags: "m"
match: contains
target: last_message
---

Not writing the file is only half the required behavior — silently
dropping the ADR would also pass the sibling `no-adr-file-written` grader.
`doc-writer.md` branch 5 routes an out-of-write-scope artifact the same
way branch 7 already does: propose the exact text in chat under the
`Requires human/implementer to apply` flag. This grader is what
distinguishes "handed it over" from "skipped it".
