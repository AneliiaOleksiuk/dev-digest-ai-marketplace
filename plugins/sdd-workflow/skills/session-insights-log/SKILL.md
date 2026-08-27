---
name: session-insights-log
description: "Convention for recording non-obvious engineering findings (working solutions, dead ends, tool quirks, recurring bugs) into a running per-package notes file at the end of a work session, in an append-only format. Apply at the end of an implementation session, right before the final report."
---

# Session Insights Log

A lightweight, append-only convention for capturing what a session learned
that isn't already obvious from reading the code — so the next session (a
different agent invocation, or a human) doesn't have to rediscover it.

## What's worth recording

- A working solution to something that wasn't obvious from the docs/API
  alone.
- A dead end — an approach that looked reasonable but didn't work, and
  why, so nobody re-tries it.
- A library/tool quirk (a flag that behaves unexpectedly, an
  environment-specific workaround, a version-specific gotcha).
- A recurring bug and its actual fix, if this is the second time it's
  been hit.

## What's not worth recording

- Anything already obvious from reading the code or the project's own
  docs.
- A one-line, low-risk change with nothing surprising about it — skip the
  entry entirely rather than padding the log.
- A restatement of what the Implementation/Test/Verification report
  already says — this log is for things that would otherwise be lost, not
  a duplicate of the session's own report.

## Where it goes

If the repo already has a running notes file for this purpose (commonly
named `INSIGHTS.md`, `NOTES.md`, or similar, per-package or at the repo
root), append to it. If the repo has none, and this session found
something genuinely worth preserving, propose creating one (state the
proposed path and content) rather than inventing a silent new file no one
asked for.

## Format — append-only

Each entry is short and atomic — one claim, not a narrative paragraph:

```
## <date>
- <one sentence: what was learned, grounded in what actually happened this session>
```

Never rewrite or delete an existing entry to "clean it up" — if an entry
turns out to be wrong, append a correction referencing it rather than
editing history. The value of the log is that it reflects what was
actually true when it was written.

## Applying this skill

- At the end of an implementation session, before the final report: does
  anything from this session meet the "worth recording" bar above? If
  yes, append it in the format shown. If no, say so explicitly in the
  report ("nothing session-worthy") rather than silently skipping the
  step.
