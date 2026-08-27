---
type: tool_used
tool: Write
input_match: "notification-prefs-export/spec\\.md"
min: 0
max: 0
target: trace
---

`spec-creator.md`'s Blocking-questions protocol: "Stop there. Do not call
`Write`... until you're resumed with the answers." A blocking gap and a
written file are mutually exclusive outcomes of the same unattended turn
— this replaces the original (misdesigned) `writes-spec-file.md` grader,
which wrongly expected both in one run. See this suite's README for how
that was found.
