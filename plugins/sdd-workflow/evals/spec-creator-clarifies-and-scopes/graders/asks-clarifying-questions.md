---
type: regex
pattern: "^## Blocking questions"
flags: "m"
match: contains
target: last_message
---

Verified against a manual dry run of this exact case (2026-08-27, no
plugin harness available yet): a faithful `spec-creator` run does not call
`AskUserQuestion` for a spawned-subagent invocation — its own "Blocking
questions" section explains that tool "does not block for you the way it
does for the top-level conversation," so the actual mechanism is a
`## Blocking questions` section in the chat report, not a tool call. This
request has no notification/preferences module anywhere in this repo to
ground a Spec in, which is a genuine blocking gap (unconfirmed target
system), not something safely left as an open question.
