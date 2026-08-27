---
name: run-plan
description: "Runs an already-approved Development Plan through the full back half of this plugin's SDD chain: implementer -> test-writer -> plan-verifier (fix-loop, capped at 3 iterations) -> architecture-reviewer (if installed) -> doc-writer -> a live smoke check against the real running app. Pauses for approval after every phase. Use when the user asks to run/build/execute a Development Plan under .sdd/ with tests included, or invokes /run-plan. Never invokes spec-creator or implementation-planner -- both run separately, by hand, before this skill starts."
---

# Run Plan

Orchestrates the full back half of this plugin's SDD agent chain (see this
plugin's `README.md`) against a Development Plan that already exists and
is already approved. Does not create or edit a Spec or a Development Plan
itself — `spec-creator` and `implementation-planner` are run manually,
outside this skill, before it starts.

## Input

The path to a Development Plan under `.sdd/<task-slug>/plan.md`, given as
the argument to `/run-plan <task-slug>` or named directly in the request.
If no slug/path is given, or the named file doesn't exist, ask the user
for the correct task slug before doing anything else — never guess, and
never fall back to running `spec-creator` or `implementation-planner` to
produce one.

Read the plan file fully before starting. If `.sdd/<task-slug>/spec.md`
also exists, read that too — `test-writer`'s oracle independence (deriving
expected behavior from the plan/spec, not from the code it's about to
read) depends on this skill having read it first and being able to inline
it.

If the invoker asked for a commit after each phase (the default assumption
whenever this skill is invoked to demonstrate the pipeline end-to-end),
say so out loud at the start and follow the per-phase commit rule below.
Otherwise, do not commit anything — never commit unless explicitly asked.

## Phase 1 — Build

Invoke the `implementer` agent (foreground), with the Development Plan's
content inlined in the prompt — don't make it re-read the file when you
already have it.

Show the user its Implementation Report (or a concise summary if long) and
get explicit approval before continuing to Phase 2. If the user requests
changes, relay them back to `implementer` rather than starting a fresh
instance.

**Per-phase commit (if requested):** commit the code changes with a message
naming the task slug and Phase 1, before moving to Phase 2.

## Phase 2 — Test

Invoke `test-writer` (foreground), inlining the Development Plan (and Spec,
if any) plus the shipped diff/Implementation Report from Phase 1. Do not
let it read `implementer`'s narrative as the source of expected behavior —
its oracle comes from the plan/spec, the diff is for wiring facts only
(import paths, exported names, fixtures), per `test-writer.md`'s own rule.

Show the user its Test Report (tests added, any behavior mismatches found
against the plan/spec). Get explicit approval before continuing.

**Per-phase commit (if requested):** commit the new test files with a
message naming the task slug and Phase 2, before moving to Phase 3.

## Phase 3 — Verify (spec compliance)

Invoke `plan-verifier` (foreground). Inline the Development Plan, the diff/
Implementation Report, and `test-writer`'s Test Report — a non-empty
`Behavior mismatches found` in that report, once `plan-verifier` confirms
it with its own evidence, becomes a `NOT MET` row, not something
`doc-writer` ever sees unaddressed.

Show the user the Plan Verification output. Once it reports
`VERDICT: PASS`, save it to `.sdd/<task-slug>/verification-report.md` —
`plan-verifier` has no `Write` tool, so this skill (or the user) persists
it. Get explicit approval before continuing.

### Fix-loop (max 3 iterations)

Loop back to `implementer` — same plan — when either is true:
- Phase 3 verdict is `FAIL` or `PASS WITH REQUIRED FIXES` (treat required
  fixes as blocking)
- `architecture-reviewer` (Phase 3b, if it already ran in a prior
  iteration) reported `FAIL` (any `critical`/`high` finding)

Give `implementer` the exact failing traceability rows / findings verbatim,
not a paraphrase. If the failing row traces to a test that was wrong
rather than code that was wrong, route the fix to `test-writer` instead —
never let `implementer` weaken or delete a test to make it pass. After the
fix is reported, re-run Phase 3 (and Phase 3b, if applicable) from
scratch — never assume the fix worked without re-checking.

State the iteration count out loud each time (e.g. "Fix-loop iteration 2 of
3"). If still unresolved after 3 iterations, stop, report the unresolved
items plainly, and wait for the user's decision — never start a 4th
iteration silently.

Get explicit approval before starting each new fix-loop iteration, same as
any other phase.

**Per-phase commit (if requested):** commit the verifier's report file
with a message naming the task slug and Phase 3, before moving to
Phase 3b.

## Phase 3b — Architecture review (only if `architecture-reviewer` is installed)

Skip this phase entirely if the `architecture-reviewer` plugin isn't
installed — do not attempt to substitute Phase 3's spec-compliance check
for it.

Invoke `architecture-reviewer` (foreground) against the same diff. Show
the user its findings. Its gate result feeds the fix-loop above: any
`critical`/`high` finding means loop back to `implementer` (see Fix-loop);
`medium`/`low`/`info` findings are surfaced to the user and do not block.

**Per-phase commit (if requested):** commit nothing new here unless a fix
came out of this phase — that fix is committed as part of the fix-loop's
own Phase 1 re-run.

## Phase 4 — Docs

Only once Phase 3's verdict is `PASS` (and Phase 3b, if it ran, has no
`critical`/`high` finding): invoke `doc-writer` (foreground), inlining the
shipped diff, the Development Plan, and Phase 3b's findings section if
that phase ran.

Show the user what was written and where. Close out with a short summary:
what shipped, what's now tested, what's now documented, and any
non-blocking findings that were noted but not fixed.

**Per-phase commit (if requested):** commit the new docs with a message
naming the task slug and Phase 4.

## Phase 5 — Smoke

Only once Phase 4 (Docs) is done: exercise the actual feature through the
real, running app — not the automated suites from Phases 1-3, which
typically run against mocked/stubbed dependencies and therefore cannot
catch a live-only failure (a misconfigured credential, a caching/timing
behavior that only "feels wrong" in a real browser, a real third-party API
quirk). A green Phase 1-3 and a `PASS` verdict prove the code is correct
as written — not that it works against this session's actual environment,
with a human clicking through it.

Find and run the project's own dev/start command (check its manifest's
scripts, its README, or its own conventions file — never guess a command
the project doesn't actually expose). Drive the ONE interaction path the
plan actually changed: for a UI-visible feature, open the real page and
click through it (a browser tool, or a raw HTTP call against the real API
if there's no UI surface yet); for a backend-only feature, hit the real
endpoint against the real running dev server, not the test suite.

If this surfaces a real defect, treat it exactly like a Phase 3/3b blocking
finding: loop back to `implementer` (or fix it directly with the user's
explicit approval, if it's small and obviously scoped) before calling the
plan done — never let a live-only bug ride along "because Phases 1-4 were
green." Show the user exactly what was exercised, what was found, and
what (if anything) needed a follow-up fix.

**Per-phase commit (if requested):** commit any fix that came out of this
phase with a message naming the task slug and Phase 5.

## Traceability matrix (when requested)

If the invoker asks for an acceptance-criterion → task → test → commit
matrix before merge, build it from: the Spec's acceptance criteria, the
Development Plan's work items (each already required to cite one), the
Test Report (which test file covers which work item), and the per-phase
commit hashes from this run. Show it as a table and flag any row with a
gap (a criterion with no task, a task with no test, a test with no commit)
plainly — do not paper over a gap with "should be covered".

## Rules

- Never invoke `spec-creator` or `implementation-planner` — run manually,
  outside this skill.
- Never skip `test-writer`.
- Never skip an approval checkpoint, even when a phase looks obviously
  fine.
- Never skip Phase 5 (Smoke), even when Phases 1-4 all came back clean —
  the automated suites typically run against mocked dependencies and
  cannot see a live-only failure by construction (see Phase 5).
- Never exceed the 3-iteration fix-loop cap without stopping to ask.
- Never commit anything unless the invoker asked for per-phase commits —
  no commit without an explicit ask.
