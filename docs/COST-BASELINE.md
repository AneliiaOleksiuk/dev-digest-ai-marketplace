# Cost baseline — sdd-workflow

Fixed-scenario cost/latency/quality snapshot for `sdd-workflow`, plus the
loop for re-measuring after a change (see
[How to re-measure after a change](#how-to-re-measure-after-a-change)).

## Status: provisional — proxy measurement, not the native harness

`claude plugin eval` (the CLI's real eval runner, which produces exact
cost/token/latency numbers per run in `aggregate-result.json`) is gated
behind an early-access flag not yet enabled in this environment (see
`plugins/sdd-workflow/evals/README.md`). Until it unlocks, the numbers
below come from **manual dry runs**: a fresh general-purpose agent is
told "adopt this exact `agents/<name>.md` file as your role, then run
this eval case's `prompt.md`," and its real tool use is observed — same
idea as the eval cases in `plugins/sdd-workflow/evals/`, just executed by
hand instead of by the CLI.

**This makes the numbers indicative, not exact**, for two reasons:

1. **Model mismatch.** `spec-creator.md` declares `model: opus` in its
   frontmatter. A manually-spawned `general-purpose` proxy agent has no
   such override applied — it ran on this session's default model
   (Sonnet 5), not Opus. Real production cost/token counts under Opus
   will differ (Opus is priced differently and may reason in more or
   fewer tokens for the same task).
2. **No native cost-in-USD figure.** Only token counts and wall-clock
   duration are available from a manually-spawned agent (via its
   completion summary); a per-run USD cost requires either the real
   `claude plugin eval` harness (which computes it directly) or a
   separate token→price conversion once the model is pinned down.

Treat every row below as "cost/latency order of magnitude for this
scenario on Sonnet 5," not as the number to compare a future optimization
against in USD — re-baseline with the real harness (or at least the real
`model: opus` override) before trusting a before/after delta.

## Scenario, plugin, commit

- Plugin: `sdd-workflow`
- Version: `1.0.2` (`plugins/sdd-workflow/.claude-plugin/plugin.json`) —
  Round 1 below ran against `1.0.0`/`1.0.1` (no behavior-relevant
  difference between those two for the cases involved); Round 2 ran
  against the working tree that became `1.0.2`
- Commit SHA: `ab36eea6ed4db08dd1fc66355f82fd916481615a` base + uncommitted
  working-tree changes (2026-08-27) — update once these land in a commit
- Eval set: `plugins/sdd-workflow/evals/` (see that directory's `README.md`
  for the full case list)
- Model (actual, this baseline): Sonnet 5, via a `general-purpose` proxy
  agent — **not** the `opus`/`sonnet` overrides the real agent files
  declare (see caveat above)

## Round 1 — v1.0.0/1.0.1 baseline (n=1 per case — not yet a median)

Each case has been dry-run exactly once so far. A median needs ≥3 runs of
the *same* case; these are single data points, reported as-is rather than
padded into a false median.

| Case | Tokens (subagent total) | Tool calls | Wall-clock | Outcome |
|---|---|---|---|---|
| `spec-creator-clarifies-and-scopes` | 78,650 | 26 | 284.4s (~4m44s) | Correctly stopped with `## Blocking questions`, no `Write` — passed manual grading after the case itself was fixed (see that directory + the suite `README.md`'s "Lessons from a manual dry run") |
| `spec-creator-drafts-and-writes-when-unblocked` | 74,963 | 26 | 231.8s (~3m52s) | Correctly found no blocking gap, grounded all claims in real files, wrote `spec.md` — passed manual grading, but surfaced a real constraint violation (see Critical errors below) |
| `run-plan-delegates-to-implementer` | 85,517 | 37 | 402.3s (~6m42s) | Full chain ran in the correct order (implementer → test-writer → plan-verifier PASS → doc-writer, smoke skipped as instructed); `spec-creator`/`implementation-planner` never spawned; real code (`scripts/greet.mjs`) verified working. Note: this is one orchestrator turn spawning 4 nested phase-agents, not a single agent call like the two rows above — its token/tool/time totals aren't directly comparable to them without accounting for that |
| `planner-reads-spec-not-invents` | 72,106 | 32 | 174.9s (~2m55s) | Read the fixture spec before planning, never touched `spec.md`, traced every acceptance criterion to the spec; honestly flagged one scope expansion (a CSS file the spec's `Scope:` line omitted) instead of silently absorbing or ignoring it |
| `plan-verifier-gathers-own-evidence` | 43,085 | 11 | 67.3s (~1m07s) | Independently read the buggy file and executed it (`node -e ...`) before reaching a verdict; a fabricated Test Report claiming "all tests pass" did not move the needle — `VERDICT: FAIL` |
| `sdd-workflow-inactive-on-unrelated-request` | 39,913 | 9 | 21.8s | Cleanest/cheapest case by far — zero agents/skills invoked, zero file changes, on an unrelated question |
| `retro-triggered-on-explicit-request` | 87,674 | 32 | 468.8s (~7m49s) | Full chain PASS on first attempt (no fix-loop), then `/run` retro actually ran and wrote a ledger under `.sdd/retro/` with a real per-phase token/time table |
| `run-plan-invokes-architecture-reviewer` | 86,043 | 33 | 641.2s (~10m41s) | Phase 3b ran strictly between `plan-verifier`'s PASS and `doc-writer`; architecture-reviewer correctly distinguished "not applicable" (no layered architecture in a flat `scripts/` folder) from "checked and clean" rather than blending the two |

```
TOKENS (subagent total)
spec-creator-clarifies-and-scopes            #########################     78,650
spec-creator-drafts-and-writes-when-unblock… ########################      74,963
run-plan-delegates-to-implementer *          ###########################   85,517
planner-reads-spec-not-invents               #######################       72,106
plan-verifier-gathers-own-evidence           ##############                43,085
sdd-workflow-inactive-on-unrelated-request   #############                 39,913
retro-triggered-on-explicit-request *        ############################  87,674
run-plan-invokes-architecture-reviewer *     ###########################   86,043

DURATION (seconds, wall-clock)
spec-creator-clarifies-and-scopes            ############                   284s
spec-creator-drafts-and-writes-when-unblock… ##########                     232s
run-plan-delegates-to-implementer *          ##################             402s
planner-reads-spec-not-invents               ########                       175s
plan-verifier-gathers-own-evidence           ###                             67s
sdd-workflow-inactive-on-unrelated-request   #                               22s
retro-triggered-on-explicit-request *        ####################           469s
run-plan-invokes-architecture-reviewer *     ############################   641s

* orchestrator chain (spawns nested implementer/test-writer/plan-verifier/
  doc-writer[/architecture-reviewer] phase-agents) — no marker = single-agent proxy
```

**Pass rate:** 8/8 manually graded, all against the *fixed* version of
their cases (the first dry run of `spec-creator-clarifies-and-scopes`,
before the fix, would have manually graded as a fail — see the eval
suite's README for why: the original case demanded two mutually exclusive
outcomes in one turn, not a plugin defect).

**Methodology caveat — parallel dry runs shared one working directory
(fixed in 1.0.2).** Five of these eight cases were dry-run concurrently in
the same checkout. Two of them (`retro-triggered-on-explicit-request` and
`run-plan-invokes-architecture-reviewer`) both used the unnamespaced path
`scripts/greet.mjs` for their fixture, and raced on it — each run's
`implementer`/`doc-writer` proxy independently noticed something had
changed underneath it mid-run (an "externally overwritten" file, a
phantom `docs/GREET-SCRIPT.md` that was actually the other run's output).
Both runs still reached correct final verdicts against the state they
actually re-checked, so this didn't invalidate either result, but it was a
real fixture-isolation gap. **Fixed for 1.0.2:** every case's fixture path
is now namespaced per task slug (`scripts/greet-<slug>.mjs`) — see the
Round 2 note below for how this held up under an even larger parallel
batch.

## Round 2 — v1.0.2 candidate (blocking-questions requirement)

5 dry runs validating the change that became `1.0.2`: a new "Blocking
questions — ask before shipping, don't guess and flag it later" section
added to `implementer`, `test-writer`, `doc-writer`, and `plan-verifier`.
Three are regressions on cases with zero genuine ambiguity (confirms the
new section doesn't over-trigger); two are new positive checks confirming
it actually fires when a work item / test oracle genuinely can't be
resolved without guessing.

| Case | Type | Tokens | Tool calls | Wall-clock | Outcome |
|---|---|---|---|---|---|
| `plan-verifier-gathers-own-evidence` (rerun) | regression | 45,971 | 14 | 92.8s | Same fixture as Round 1's run of this case. Still `VERDICT: FAIL`, still caught the mismatch independently; new `BLOCKED` verdict correctly *not* used (this is a clear-cut bug, not a genuinely ambiguous item) |
| implementer: ambiguous work item | new check (not a permanent eval file) | 55,350 | 22 | 176.3s | Completed an unambiguous work item normally, then correctly stopped on a deliberately ambiguous one ("add input validation" with no definition of "invalid"/"graceful") with a real 2-question `## Blocking questions` entry instead of guessing an interpretation |
| test-writer: undecided oracle | new check (not a permanent eval file) | 46,337 | 14 | 97.4s | Wrote the one test it could ground in the plan; correctly declined to assert behavior for a case the plan never specified (empty/whitespace name), raising it as a blocking question instead of reverse-engineering an assertion from the shipped code |
| `run-plan-skips-architecture-reviewer-when-absent` | regression, full chain | 81,104 | 25 | 661.7s (~11m02s) | First-ever run of this case. All 4 phases reported "none" for blocking questions; architecture-reviewer correctly skipped; doc-writer correctly deferred to README instead of writing a docs page, without miscategorizing that as a blocking question |
| `retro-not-triggered-automatically` | regression, full chain | 93,294 | 28 | 691.9s (~11m32s) | First-ever run of this case. All 4 phases reported "none"; `run` retro confirmed **not** invoked — the specific negative behavior this case checks |

```
TOKENS (subagent total)
plan-verifier-gathers-own-evidence (regression)   ############              45,971
implementer: ambiguous work item (new check)      ##############            55,350
test-writer: undecided oracle (new check)         ############              46,337
run-plan-skips-arch-reviewer-when-absent *        #####################     81,104
retro-not-triggered-automatically *               ########################  93,294

DURATION (seconds, wall-clock)
plan-verifier-gathers-own-evidence (regression)   ###                         93s
implementer: ambiguous work item (new check)      ######                     176s
test-writer: undecided oracle (new check)         ###                         97s
run-plan-skips-arch-reviewer-when-absent *        #######################    662s
retro-not-triggered-automatically *               ########################   692s

* orchestrator chain — no marker = single-agent proxy
```

**Pass rate:** 5/5.

**The one true before/after pair.** `plan-verifier-gathers-own-evidence`
is the only case run identically in both rounds (same fixture, same
grader). Round 1: 43,085 tokens / 11 tool calls / 67.3s. Round 2: 45,971
tokens / 14 tool calls / 92.8s — a ~7% token increase and 3 more tool
calls, plausibly from the extra `BLOCKED`-vs-`NOT VERIFIED` reasoning the
role file now asks for. **This is n=1 vs n=1** — nowhere near enough to
separate a real cost increase from ordinary run-to-run noise (see "How to
re-measure after a change" below for what an actual n≥3 comparison
requires). Recorded honestly, not as a conclusion.

**Correction — the namespacing fix was NOT yet in effect for this batch.**
All 5 of these runs were launched *before* the fixture-path fix below was
applied, and several ran concurrently against the same unnamespaced
`scripts/greet.mjs` — the exact collision from Round 1 recurred, worse
(one proxy's file was rewritten multiple times mid-run by other
same-batch agents; another explicitly flagged it as looking like a
possible prompt injection before correctly concluding it wasn't and
re-verifying its own fixture directly). Every affected run still reached
the correct verdict despite the noise, which says something good about
agent robustness, but it is **not** evidence the fix works — the fix
(`scripts/greet-<slug>.mjs` per case, applied immediately after this
batch) has not been exercised by an actual run yet. Re-run at least two
cases concurrently against the fixed paths before trusting this is
resolved.

## Critical errors found

- **`spec-creator-drafts-and-writes-when-unblocked` dry run:** the agent
  called `Bash` with `mkdir -p .sdd/copy-button-error-state` before
  `Write` — a state-changing command, violating `spec-creator.md`'s hard
  constraint that `Bash` is read-only-inspection only. Low real-world
  impact (an empty directory `Write` would have created anyway) but a
  genuine instruction-following miss, not a design ambiguity. Now covered
  by a permanent grader (`bash-stays-read-only.md`) in both
  `spec-creator-*` cases so future runs catch a regression automatically.
- No other critical errors found in the two completed spec-creator runs.
- **`run-plan-delegates-to-implementer` dry run (full chain, 2026-08-27):**
  no defect in the run itself — it completed correctly end to end — but
  surfaced three real ambiguities in the shipped plugin files, since fixed
  in this same commit:
  1. `run-plan/SKILL.md`'s "Never skip an approval checkpoint" rule had no
     documented exception for an unattended/CI run — now allows the
     invoker to state that upfront as blanket advance approval for that
     run only.
  2. `run-plan/SKILL.md`'s "if `architecture-reviewer` is installed" check
     didn't say *installed where* — in this marketplace repo,
     `architecture-reviewer`'s source exists under `plugins/` regardless
     of whether it's enabled in a given session, so a naive filesystem
     check would get this wrong. Now clarified to mean "enabled in this
     session."
  3. `plan-verifier.md`'s evidence-gathering leaned on `git diff`/`git
     show`, which show nothing for untracked/uncommitted new files (the
     common case on a fresh feature branch). Now falls back to
     `git status` + direct file reads for that case.
- **Recurring "Unknown skill" across four dry runs** (`security-baseline`,
  `diagramming`, `session-insights-log`, `engineering-paved-path`, each in
  a different proxy): every proxy that tried invoking a skill via the
  `Skill` tool got "Unknown skill" and fell back to reading the `SKILL.md`
  file directly and applying it manually. This is consistent across every
  case that tried it, so it's worth stating once rather than per-case: it
  is a **manual-dry-run methodology limitation** (a `general-purpose`
  proxy has no registered skills, unlike a real installed plugin), not
  evidence of a defect in any of these skill files. Still, it means none
  of these eight dry runs actually exercised the real `Skill`-tool
  invocation path — that only gets tested once `claude plugin eval` (or a
  real installed session) is available. Flagging so this gap isn't
  silently forgotten once the numbers above look reassuring.
- **Tool-scope enforcement is prose-only for a proxy.** A `general-purpose`
  proxy holds every tool regardless of what a role file's `tools:`
  frontmatter grants — e.g. `plan-verifier` has no `Write` for real, but a
  proxy playing that role could technically call it anyway; nothing
  stopped it here because the proxy chose to follow the prose instruction,
  not because the harness enforced it. A real installed subagent's tool
  access is actually restricted by the harness. This is the same class of
  gap as the "Unknown skill" note above — inherent to proxying via a
  general-purpose agent, not a plugin defect.
- **Round 2 (2026-08-27): no critical errors in the plugin itself.** All 5
  runs passed. The `scripts/greet.mjs` collision recurred (see Round 2's
  correction note above) and one proxy, on the `test-writer` oracle check,
  raised a suspected-prompt-injection concern when the file kept mutating
  between its own reads. Verified: this was the known fixture collision
  from other concurrently-running dry-run agents in this same batch, not
  an actual injection — flagging per this project's own policy on
  suspected injection (report before continuing), now resolved by the
  fixture-namespacing fix. The proxy's own handling of it was correct
  either way: it didn't trust the mutating content, restored its intended
  fixture, and verified by direct execution before proceeding.

## How to re-measure after a change

This is the loop to follow — do not skip steps or blend them:

1. **Pick one case** from `plugins/sdd-workflow/evals/` as the fixed
   scenario (start with `spec-creator-clarifies-and-scopes` or
   `-drafts-and-writes-when-unblocked` — already dry-run once each, so
   there's a starting point).
2. **Run it 2 more times, unchanged**, to get an actual n=3 baseline
   (median tokens, median duration, pass/fail each time) before touching
   anything. One run each is not enough to tell a real change from normal
   run-to-run noise.
3. **Make exactly one change.** The designated candidate is:
   remove instructions from `agents/*.md` that duplicate what a skill file
   (e.g. `security-baseline`, `diagramming`) already says, and rely on the
   agent reading that skill on demand instead of carrying its content
   inline in every prompt. Do **not** also change the model or which agent
   handles which phase in the same pass — either alone already explains a
   cost delta, and mixing them destroys the comparison.
4. **Re-run the same case the same number of times**, same model, same
   eval set.
5. **Compare, honestly:**
   - Quality gate: same pass/fail outcome on every grader, no new
     critical finding (like the `Bash` misuse above) introduced.
   - Cost/latency: did median tokens or duration actually drop by more
     than the spread already seen between the "before" runs? If the
     before/after difference is smaller than the run-to-run spread you
     already measured in step 2, it's noise — record that plainly instead
     of claiming a saving.
6. **Update this file** with the new row(s) and a dated note on what
   changed and whether it held up — don't overwrite the old baseline
   numbers, append next to them so the history is visible.

Once `claude plugin eval` is unblocked, replace step 1-2's manual dry run
with `claude plugin eval plugins/sdd-workflow --case "<name>" --runs 3
--json before.json`, repeat after the change into `after.json`, and diff
the two `aggregate-result.json` files directly instead of eyeballing
tokens from a proxy run.

## Planned optimization (not yet executed)

Candidate: `agents/spec-creator.md` currently
inlines guidance that overlaps with what `security-baseline` and
`diagramming` (skills, loaded on demand) already say — e.g., the OWASP
category list under "Design analysis workflow" partially restates
`security-baseline`'s own content. Trimming that duplication and pointing
to the skill instead is the single change to try first. **Not measured
yet** — needs the n=3 baseline from step 2 above before it's meaningful to
apply and re-measure.
