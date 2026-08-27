---
name: "spec-creator raises blocking questions instead of guessing, and never writes past them"
tags: ["spec-creation", "clarification"]
plugins: ["sdd-workflow"]
runs: 3
max_turns: 12
timeout_seconds: 300
---

We need a Spec for a new feature: "let users export their notification
preferences as a file and re-import them on another device." There is no
existing spec for this. Use the `spec-creator` agent to draft it.

Task slug: `notification-prefs-export`.

This is a fully unattended eval run — no further reply will come after
this message. If, after drafting as far as you responsibly can, you
determine there is a genuinely blocking gap (per your own "Blocking
questions — stop and wait, don't guess" rule), stop there exactly as that
rule says: report the partial draft and the blocking questions, and do
not call `Write`. Do not invent an answer just because no human is
actually available to reply.
