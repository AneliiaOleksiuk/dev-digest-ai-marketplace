# sdd-workflow — eval suite

Behavior evals for the checks listed in `docs/SDD-PLUGINS-SPEC.md`'s
verification list. Schema validation (`claude plugin validate`) already
covers file shape; these cases cover whether the *composition* — six
agents, `run-plan`, the manual `run` retro — actually does the right
thing.

## Status: written, not yet run

`claude plugin eval` is gated behind an early-access flag in this CLI
(2.1.247, self-tested — `claude plugin eval .` returns `` `plugin eval` is
currently in early access`` as of 2026-08-27). This account has no
telemetry-disabling env vars and no Bedrock/Vertex/custom base URL, so the
gate looks like a server-side rollout rather than something we can flip
locally — retry with `claude update` periodically, or after a CLI version
bump.

The case format below (`prompt.md` frontmatter + `graders/*.md`) is
reconstructed from `claude plugin eval --help` and a documentation lookup,
**not verified by an actual run**. Once the gate lifts, run:

```
claude plugin eval plugins/sdd-workflow
```

from the repo root and expect either a clean run or field-level errors
that pin down what to fix in these files — treat the first real run as a
schema check, not just a behavior check. Results land in
`plugins/sdd-workflow/evals/results/<timestamp>/aggregate-result.json`
(+ `report.html`) — that's plugin-local, not part of the marketplace-ui
site; it is not surfaced on GitHub Pages unless `build-index.mjs` is later
extended to read it.

## What's covered vs. not

| Checklist item | Case |
|---|---|
| spec-creator raises a genuine blocking gap and stops without writing | `spec-creator-clarifies-and-scopes/` |
| spec-creator drafts and writes in the same turn when nothing blocks it | `spec-creator-drafts-and-writes-when-unblocked/` |
| implementation-planner reads an existing spec, doesn't invent requirements | `planner-reads-spec-not-invents/` |
| run-plan hands off to implementer first (never spec-creator/planner) | `run-plan-delegates-to-implementer/` |
| review gate invokes architecture-reviewer when installed | `run-plan-invokes-architecture-reviewer/` |
| review gate skips cleanly when architecture-reviewer isn't installed | `run-plan-skips-architecture-reviewer-when-absent/` |
| plan-verifier gathers its own evidence, doesn't trust implementer's report | `plan-verifier-gathers-own-evidence/` |
| workflow-retro (`run`) never fires on its own after a chain finishes | `retro-not-triggered-automatically/` |
| workflow-retro fires on an explicit `/run` request | `retro-triggered-on-explicit-request/` |
| unrelated request never activates the SDD workflow (negative eval) | `sdd-workflow-inactive-on-unrelated-request/` |

**Not covered here — already handled elsewhere:** "namespaced skills load
without warnings" is a load-time/schema concern, already checked by
`claude plugin validate .` (passes, one unrelated `tags` warning — see
`docs/PLUGIN-GUIDELINES.md`) and by starting a session with
`--plugin-dir` pointed at all four plugins. It doesn't need a behavior eval
case.

## Lessons from a manual dry run (2026-08-27)

With `claude plugin eval` gated, `spec-creator-clarifies-and-scopes` was
dry-run manually — a fresh agent given `agents/spec-creator.md` as its full
role definition and this case's `prompt.md` as the task, with no shortcuts
taken to make the run "pass." Two real design bugs in the *original*
version of that case turned up, both now fixed:

1. **`AskUserQuestion` isn't the real mechanism for a spawned subagent.**
   `spec-creator.md`'s own text says that tool "does not block for you the
   way it does for the top-level conversation" when spawned via `Agent` —
   the actual protocol is a `## Blocking questions` section in the chat
   report, then stopping. A grader asserting `tool_used: AskUserQuestion`
   was checking for the wrong signal entirely.
2. **A blocking gap and a written file are mutually exclusive within one
   unattended turn.** `spec-creator.md`'s hard constraints ("draft in chat
   first, write only after explicit approval") and its Blocking-questions
   protocol ("stop there, do not call Write... until resumed") describe a
   two-turn handshake. An eval case with no scripted second turn can
   produce *one* of those outcomes, never both — the original case
   asserted both `tool_used: AskUserQuestion` and `file_exists: spec.md` in
   the same run, which no faithful implementation could satisfy. Fixed by
   splitting into two cases: one with a genuine blocking gap (expects no
   `Write`), one with everything groundable plus explicit advance approval
   stated in the prompt itself (expects `Write` in the same turn).

The same two-turn-handshake shape shows up in `implementation-planner.md`
("Execution mode: confirm before finalizing the plan" — raises a blocking
question unless the user already stated a mode). `planner-reads-spec-not-invents/`'s
prompt states the execution mode explicitly for exactly this reason — and
also switched its spec fixture from an invented "auth service" (nothing in
this repo resembles one) to a real, grounded gap in `marketplace-ui`
(`copyToClipboard` swallowing failures) after noticing the first fixture
would hit the same "nothing here to ground this in" wall spec-creator hit.

**Takeaway for any future case in this suite:** before assuming a grader
is checking the plugin's behavior, check whether it's actually checking
two outcomes the agent's own file treats as sequential across a
resume/approval boundary — no amount of prompt-tuning fixes that; the
case has to split.

A second dry run, after the fix, confirmed
`spec-creator-drafts-and-writes-when-unblocked/`: the agent found no
blocking gap, grounded every claim in the four named real files, and
called `Write` in the same turn as intended. It also surfaced a genuine
(if minor) constraint violation worth a permanent grader: it ran
`mkdir -p .sdd/copy-button-error-state` via `Bash` before writing, even
though `spec-creator.md` restricts `Bash` to read-only inspection only
(`Write` already creates missing parent directories, so there's never a
legitimate reason to shell out for this) — added as `bash-stays-read-only.md`
to both `spec-creator-*` cases.

## Grader idioms used

- `tool_used` with `tool: Agent` and an `input_match` regex on the
  subagent name — detects which sub-agent got spawned. The exact shape of
  that field in the trace (bare name vs. `plugin:agent` namespacing) isn't
  confirmed by a real run yet; regexes below tolerate an optional
  `sdd-workflow:` prefix. Adjust once a real trace is visible.
- `tool_used` with `min: 0, max: 0` — asserts an agent/skill was **not**
  invoked (the negative-eval and retro-not-automatic cases lean on this).
- `llm` grader for semantic judgments a regex can't make reliably (e.g.
  "does this Spec contain implementation details").
